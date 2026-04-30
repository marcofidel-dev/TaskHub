package com.taskhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WompiPaymentRequest {

    @NotBlank(message = "Plan is required")
    private String plan; // PRO, TEAM

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotBlank(message = "Payment token is required")
    private String paymentToken; // From Wompi frontend SDK

    @NotBlank(message = "Reference is required")
    private String reference; // Unique payment reference

    private String description;
}
