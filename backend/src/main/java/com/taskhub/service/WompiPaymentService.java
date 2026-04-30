package com.taskhub.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.taskhub.config.WompiConfig;
import com.taskhub.dto.WompiPaymentRequest;
import com.taskhub.dto.WompiPaymentResponse;
import com.taskhub.dto.WompiWebhookPayload;
import com.taskhub.entity.SubscriptionTransaction;
import com.taskhub.repository.SubscriptionTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WompiPaymentService {

    private final WompiConfig wompiConfig;
    private final SubscriptionTransactionRepository subscriptionTransactionRepository;
    private final PlanService planService;
    private final Gson gson;

    public WompiPaymentResponse processPayment(Long userId, WompiPaymentRequest request) {
        try {
            if (!request.getPlan().matches("^(PRO|TEAM)$")) {
                return WompiPaymentResponse.builder()
                        .success(false)
                        .status("ERROR")
                        .message("Invalid plan")
                        .errorCode("INVALID_PLAN")
                        .build();
            }

            BigDecimal expectedAmount = "PRO".equals(request.getPlan())
                    ? new BigDecimal("3.50")
                    : new BigDecimal("9.99");

            if (!request.getAmount().equals(expectedAmount)) {
                return WompiPaymentResponse.builder()
                        .success(false)
                        .status("ERROR")
                        .message("Amount does not match plan price")
                        .errorCode("AMOUNT_MISMATCH")
                        .build();
            }

            JsonObject paymentMethod = new JsonObject();
            paymentMethod.addProperty("type", "CARD");
            paymentMethod.addProperty("token", request.getPaymentToken());

            JsonObject wompiRequest = new JsonObject();
            wompiRequest.addProperty("amount_in_cents",
                    request.getAmount().multiply(new BigDecimal(100)).longValue());
            wompiRequest.addProperty("currency", "COP");
            wompiRequest.addProperty("reference", request.getReference());
            wompiRequest.add("payment_method", paymentMethod);
            wompiRequest.addProperty("customer_email", "user@taskhub.local");
            wompiRequest.addProperty("description",
                    request.getDescription() != null ? request.getDescription() : "TaskHub Plan Upgrade");

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest wompiHttpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(wompiConfig.getApiUrl() + "/v1/transactions"))
                    .header("Authorization", wompiConfig.getAuthHeader())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(wompiRequest.toString()))
                    .build();

            HttpResponse<String> response = client.send(wompiHttpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 201 && response.statusCode() != 200) {
                log.error("Wompi API error: {}", response.body());
                return WompiPaymentResponse.builder()
                        .success(false)
                        .status("ERROR")
                        .message("Payment processing failed")
                        .errorCode("WOMPI_ERROR")
                        .build();
            }

            JsonObject wompiResponse = gson.fromJson(response.body(), JsonObject.class);
            JsonObject data = wompiResponse.getAsJsonObject("data");

            String transactionId = data.get("id").getAsString();
            String status = data.get("status").getAsString();
            boolean isApproved = "APPROVED".equals(status);

            SubscriptionTransaction transaction = SubscriptionTransaction.builder()
                    .userId(userId)
                    .plan(request.getPlan())
                    .amount(request.getAmount())
                    .currency("COP")
                    .transactionId(transactionId)
                    .status(status)
                    .paymentMethod("WOMPI")
                    .build();

            subscriptionTransactionRepository.save(transaction);

            if (isApproved) {
                planService.upgradeToPlan(userId, request.getPlan());
                log.info("User {} upgraded to {} plan via Wompi transaction {}", userId, request.getPlan(), transactionId);
            }

            return WompiPaymentResponse.builder()
                    .success(isApproved)
                    .transactionId(transactionId)
                    .status(status)
                    .message(isApproved ? "Payment approved and plan upgraded" : "Payment declined by bank")
                    .amount(request.getAmount())
                    .plan(request.getPlan())
                    .reference(request.getReference())
                    .processedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error processing Wompi payment", e);
            return WompiPaymentResponse.builder()
                    .success(false)
                    .status("ERROR")
                    .message("Payment processing error: " + e.getMessage())
                    .errorCode("PROCESSING_ERROR")
                    .build();
        }
    }

    public void handleWebhook(WompiWebhookPayload payload, String signature) {
        try {
            if (!verifyWebhookSignature(gson.toJson(payload), signature)) {
                log.warn("Invalid webhook signature");
                throw new RuntimeException("Invalid webhook signature");
            }

            if (!"transaction.updated".equals(payload.getEvent())) {
                return;
            }

            WompiWebhookPayload.WompiTransactionData data = payload.getData();
            String transactionId = data.getId();
            String newStatus = data.getStatus();

            SubscriptionTransaction transaction = subscriptionTransactionRepository
                    .findByTransactionId(transactionId)
                    .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));

            // Capture previous status before overwriting
            String previousStatus = transaction.getStatus();

            transaction.setStatus(newStatus);
            subscriptionTransactionRepository.save(transaction);

            if ("APPROVED".equals(newStatus) && !"APPROVED".equals(previousStatus)) {
                planService.upgradeToPlan(transaction.getUserId(), transaction.getPlan());
                log.info("User {} upgraded to {} via webhook", transaction.getUserId(), transaction.getPlan());
            }

        } catch (Exception e) {
            log.error("Error processing webhook", e);
        }
    }

    private boolean verifyWebhookSignature(String payload, String signature) {
        try {
            String secret = wompiConfig.getWebhookSecret();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            String computed = Base64.getEncoder().encodeToString(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }
}
