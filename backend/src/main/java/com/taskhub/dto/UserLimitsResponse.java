package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLimitsResponse {

    private String plan;

    private Integer tasksCurrent;
    private Integer tasksLimit;
    private Double tasksPercentage;

    private Integer categoriesCurrent;
    private Integer categoriesLimit;
    private Double categoriesPercentage;

    private Integer timeTrackingLimit;
    private Integer subtasksLimit;
    private Boolean analyticsEnabled;
    private Boolean exportEnabled;
    private Boolean collaborationEnabled;
}
