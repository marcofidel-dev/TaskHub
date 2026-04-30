package com.taskhub.controller;

import com.taskhub.dto.WompiWebhookPayload;
import com.taskhub.service.WompiPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks/wompi")
@RequiredArgsConstructor
@Slf4j
public class WompiWebhookController {

    private final WompiPaymentService wompiPaymentService;

    @PostMapping
    public ResponseEntity<?> handleWompiWebhook(
            @RequestBody WompiWebhookPayload payload,
            @RequestHeader(value = "X-WOMPI-SIGNATURE", required = false) String signature) {

        try {
            log.info("Received Wompi webhook: {}", payload.getEvent());
            wompiPaymentService.handleWebhook(payload, signature);
            return ResponseEntity.ok(Map.of("status", "received"));
        } catch (Exception e) {
            log.error("Error handling Wompi webhook", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
