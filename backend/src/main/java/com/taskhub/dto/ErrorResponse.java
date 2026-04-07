package com.taskhub.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

    private String error;
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponse(String validationError, String message) {
    }
}
