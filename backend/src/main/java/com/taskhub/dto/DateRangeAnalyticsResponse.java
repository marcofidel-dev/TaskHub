package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DateRangeAnalyticsResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private Integer daysInRange;
    private Integer totalTasksCreated;
    private Integer totalTasksCompleted;
    private BigDecimal totalHoursTracked;
    private Double averageTasksPerDay;
    private List<DailyMetrics> dailyData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyMetrics {
        private LocalDate date;
        private Integer tasksCreated;
        private Integer tasksCompleted;
        private BigDecimal hoursTracked;
        private String dayOfWeek;
    }
}
