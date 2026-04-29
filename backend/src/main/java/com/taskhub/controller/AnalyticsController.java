package com.taskhub.controller;

import com.taskhub.dto.*;
import com.taskhub.security.CurrentUser;
import com.taskhub.service.AnalyticsService;
import com.taskhub.service.FeatureAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final FeatureAccessService featureAccessService;

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDashboardResponse> getDashboard(@CurrentUser Long userId) {
        if (!featureAccessService.canUseFeature(userId, "analytics_basic")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(analyticsService.getDashboard(userId));
    }

    @GetMapping("/completion")
    public ResponseEntity<CompletionMetricsResponse> getCompletionMetrics(@CurrentUser Long userId) {
        if (!featureAccessService.canUseFeature(userId, "analytics_basic")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(analyticsService.getCompletionMetrics(userId));
    }

    @GetMapping("/time-tracking")
    public ResponseEntity<TimeTrackingAnalyticsResponse> getTimeTrackingAnalytics(@CurrentUser Long userId) {
        if (!featureAccessService.canUseFeature(userId, "analytics_basic")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(analyticsService.getTimeTrackingAnalytics(userId));
    }

    @GetMapping("/categories")
    public ResponseEntity<CategoryProductivityResponse> getCategoryProductivity(@CurrentUser Long userId) {
        if (!featureAccessService.canUseFeature(userId, "analytics_basic")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(analyticsService.getCategoryProductivity(userId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<DateRangeAnalyticsResponse> getDateRangeAnalytics(
            @CurrentUser Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (!featureAccessService.canUseFeature(userId, "analytics_basic")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(analyticsService.getDateRangeAnalytics(userId, startDate, endDate));
    }
}
