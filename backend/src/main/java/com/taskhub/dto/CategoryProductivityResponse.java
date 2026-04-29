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
public class CategoryProductivityResponse {

    private List<CategoryMetrics> categories;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryMetrics {
        private Long categoryId;
        private String categoryName;
        private Integer totalTasks;
        private Integer completedTasks;
        private Double completionPercentage;
        private BigDecimal totalHours;
        private Integer totalTimeEntries;
        private Integer subtaskCount;
    }
}
