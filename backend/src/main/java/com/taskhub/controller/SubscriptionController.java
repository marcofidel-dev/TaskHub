package com.taskhub.controller;

import com.taskhub.dto.CurrentPlanResponse;
import com.taskhub.dto.ErrorResponse;
import com.taskhub.dto.WompiPaymentRequest;
import com.taskhub.dto.WompiPaymentResponse;
import com.taskhub.security.CurrentUser;
import com.taskhub.service.FeatureAccessService;
import com.taskhub.service.PlanService;
import com.taskhub.service.WompiPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final PlanService planService;
    private final FeatureAccessService featureAccessService;
    private final WompiPaymentService wompiPaymentService;

    @GetMapping("/current")
    public ResponseEntity<CurrentPlanResponse> getCurrentPlan(@CurrentUser Long userId) {
        return ResponseEntity.ok(CurrentPlanResponse.builder()
                .plan(planService.getPlanForUser(userId))
                .expiryDate(planService.getSubscriptionExpiry(userId))
                .features(featureAccessService.getEnabledFeatureNames(userId))
                .subscriptionStatus(planService.getSubscriptionStatus(userId))
                .build());
    }

    @PostMapping("/upgrade")
    public ResponseEntity<WompiPaymentResponse> upgradePlan(
            @CurrentUser Long userId,
            @Valid @RequestBody WompiPaymentRequest request) {

        WompiPaymentResponse response = wompiPaymentService.processPayment(userId, request);

        if (Boolean.TRUE.equals(response.getSuccess())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(@CurrentUser Long userId) {
        try {
            planService.downgradeToFree(userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Subscription cancelled. Downgraded to Free plan."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(new ErrorResponse("VALIDATION_ERROR", e.getMessage(), LocalDateTime.now()));
        }
    }
}
