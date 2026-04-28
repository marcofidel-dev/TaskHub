package com.taskhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanUpgradeRequest {

    @NotBlank(message = "Plan is required")
    @Pattern(regexp = "^(PRO|TEAM)$", message = "Plan must be PRO or TEAM")
    private String plan;

    @NotBlank(message = "Wompi transaction ID is required")
    private String wompiTransactionId;
}
