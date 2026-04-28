package com.taskhub.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanUpgradeResponse {

    private boolean success;
    private String plan;
    private LocalDateTime expiryDate;
    private String message;
}
