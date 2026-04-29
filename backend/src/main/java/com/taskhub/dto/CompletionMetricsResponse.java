package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletionMetricsResponse {

    private Integer totalTasks;
    private Integer completedTasks;
    private Integer remainingTasks;
    private Double completionPercentage;
    private List<CompletionByCategory> byCategory;
    private List<CompletionByPriority> byPriority;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletionByCategory {
        private String categoryName;
        private Integer total;
        private Integer completed;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletionByPriority {
        private String priority;
        private Integer total;
        private Integer completed;
        private Double percentage;
    }
}
