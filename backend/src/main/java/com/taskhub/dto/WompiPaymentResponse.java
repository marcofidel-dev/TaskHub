package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WompiPaymentResponse {

    private Boolean success;
    private String transactionId;
    private String status; // PENDING, APPROVED, DECLINED, ERROR
    private String message;
    private BigDecimal amount;
    private String plan;
    private String reference;
    private LocalDateTime processedAt;
    private String errorCode;
    private String errorMessage;
}
