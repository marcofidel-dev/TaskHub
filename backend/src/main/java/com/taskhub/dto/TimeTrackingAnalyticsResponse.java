package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeTrackingAnalyticsResponse {

    private BigDecimal totalHours;
    private Integer totalMinutes;
    private Integer timeEntriesCount;
    private BigDecimal averageHoursPerTask;
    private List<TimeByCategory> byCategory;
    private List<TimeByDay> byDay;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeByCategory {
        private String categoryName;
        private BigDecimal hours;
        private Integer minutes;
        private Integer taskCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeByDay {
        private String dayOfWeek;
        private BigDecimal hours;
        private Integer taskCount;
    }
}
