package com.taskhub.service;

import com.taskhub.entity.FeatureAccess;
import com.taskhub.repository.FeatureAccessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureAccessService {

    private final FeatureAccessRepository featureAccessRepository;

    private static final Map<String, List<String>> PLAN_FEATURES = Map.of(
            "FREE", List.of(),
            "PRO", List.of(
                    "time_tracking",
                    "subtasks",
                    "analytics_basic",
                    "google_calendar",
                    "csv_export"
            ),
            "TEAM", List.of(
                    "time_tracking",
                    "subtasks",
                    "analytics_basic",
                    "google_calendar",
                    "csv_export",
                    "team_collaboration",
                    "comments",
                    "permissions",
                    "slack_integration",
                    "api_access"
            )
    );

    public boolean canUseFeature(Long userId, String featureName) {
        return featureAccessRepository
                .findByUserIdAndFeatureName(userId, featureName)
                .map(FeatureAccess::getEnabled)
                .orElse(false);
    }

    public List<String> getEnabledFeatureNames(Long userId) {
        return featureAccessRepository.findByUserId(userId).stream()
                .filter(FeatureAccess::getEnabled)
                .map(FeatureAccess::getFeatureName)
                .toList();
    }

    @Transactional
    public void updateFeaturesForPlan(Long userId, String plan) {
        featureAccessRepository.deleteAllByUserId(userId);

        List<String> features = PLAN_FEATURES.getOrDefault(plan, List.of());
        for (String feature : features) {
            featureAccessRepository.save(FeatureAccess.builder()
                    .userId(userId)
                    .featureName(feature)
                    .enabled(true)
                    .build());
        }
        log.debug("Updated features for userId={} to plan={}: {}", userId, plan, features);
    }
}
