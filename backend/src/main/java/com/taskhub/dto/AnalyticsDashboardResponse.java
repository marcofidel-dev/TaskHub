package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDashboardResponse {

    private LocalDate generatedAt;
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer remainingTasks;
    private Double completionPercentage;
    private BigDecimal totalHoursTracked;
    private Integer totalTimeEntriesCount;
    private String mostProductiveCategory;
    private Integer tasksThisWeek;
    private Integer completedThisWeek;
    private Double weeklyTrend;
}
