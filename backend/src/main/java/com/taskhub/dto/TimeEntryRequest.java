package com.taskhub.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntryRequest {

    @NotNull(message = "Hours is required")
    @PositiveOrZero(message = "Hours must be greater than or equal to 0")
    private BigDecimal hours;

    @PositiveOrZero(message = "Minutes must be between 0 and 59")
    private Integer minutes;

    private String description;

    private LocalDate entryDate;
}
