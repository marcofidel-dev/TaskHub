package com.taskhub.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentPlanResponse {

    private String plan;
    private LocalDateTime expiryDate;
    private List<String> features;
    private String subscriptionStatus;
}
