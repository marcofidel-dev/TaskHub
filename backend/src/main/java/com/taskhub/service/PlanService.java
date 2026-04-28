package com.taskhub.service;

import com.taskhub.entity.UserPlan;
import com.taskhub.repository.UserPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanService {

    private final UserPlanRepository userPlanRepository;
    private final FeatureAccessService featureAccessService;

    public String getPlanForUser(Long userId) {
        return userPlanRepository.findByUserId(userId)
                .map(UserPlan::getPlan)
                .orElse("FREE");
    }

    public String getSubscriptionStatus(Long userId) {
        return userPlanRepository.findByUserId(userId)
                .map(UserPlan::getSubscriptionStatus)
                .orElse("ACTIVE");
    }

    public LocalDateTime getSubscriptionExpiry(Long userId) {
        return userPlanRepository.findByUserId(userId)
                .map(UserPlan::getSubscriptionEndDate)
                .orElse(null);
    }

    @Transactional
    public void upgradeToPlan(Long userId, String plan) {
        UserPlan userPlan = userPlanRepository.findByUserId(userId)
                .orElse(UserPlan.builder().userId(userId).build());

        userPlan.setPlan(plan);
        userPlan.setSubscriptionStatus("ACTIVE");
        userPlan.setSubscriptionStartDate(LocalDateTime.now());
        userPlan.setSubscriptionEndDate(LocalDateTime.now().plusMonths(1));
        userPlan.setAutoRenewal(true);
        userPlan.setPaymentMethod("WOMPI");

        userPlanRepository.save(userPlan);
        featureAccessService.updateFeaturesForPlan(userId, plan);
        log.info("User {} upgraded to plan {}", userId, plan);
    }

    @Transactional
    public void downgradeToFree(Long userId) {
        UserPlan userPlan = userPlanRepository.findByUserId(userId)
                .orElse(UserPlan.builder().userId(userId).build());

        userPlan.setPlan("FREE");
        userPlan.setSubscriptionStatus("CANCELLED");
        userPlan.setSubscriptionEndDate(null);
        userPlan.setAutoRenewal(false);

        userPlanRepository.save(userPlan);
        featureAccessService.updateFeaturesForPlan(userId, "FREE");
        log.info("User {} downgraded to FREE plan", userId);
    }
}
