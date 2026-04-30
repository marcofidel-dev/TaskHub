package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanLimitExceededResponse {

    private String error;
    private String message;
    private Integer current;
    private Integer limit;
    private String plan;
    private String upgradeTo;
    private String upgradeUrl;
    private Double percentageUsed;
}
