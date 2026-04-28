package com.taskhub.controller;

import com.taskhub.dto.CurrentPlanResponse;
import com.taskhub.dto.ErrorResponse;
import com.taskhub.dto.PlanUpgradeRequest;
import com.taskhub.dto.PlanUpgradeResponse;
import com.taskhub.security.CurrentUser;
import com.taskhub.service.FeatureAccessService;
import com.taskhub.service.PlanService;
import com.taskhub.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final PlanService planService;
    private final FeatureAccessService featureAccessService;
    private final SubscriptionService subscriptionService;

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
    public ResponseEntity<?> upgradePlan(
            @CurrentUser Long userId,
            @Valid @RequestBody PlanUpgradeRequest request
    ) {
        try {
            // TODO: Validate Wompi transaction before upgrading
            planService.upgradeToPlan(userId, request.getPlan());

            BigDecimal amount = "PRO".equals(request.getPlan())
                    ? new BigDecimal("3.50")
                    : new BigDecimal("9.99");

            subscriptionService.recordTransaction(
                    userId, request.getPlan(), amount,
                    request.getWompiTransactionId(), "COMPLETED");

            return ResponseEntity.ok(PlanUpgradeResponse.builder()
                    .success(true)
                    .plan(request.getPlan())
                    .expiryDate(planService.getSubscriptionExpiry(userId))
                    .message("Successfully upgraded to " + request.getPlan())
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(new ErrorResponse("VALIDATION_ERROR", e.getMessage(), LocalDateTime.now()));
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
