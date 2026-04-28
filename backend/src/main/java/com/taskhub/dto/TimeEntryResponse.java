package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntryResponse {

    private Long id;
    private Long taskId;
    private BigDecimal hours;
    private Integer minutes;
    private BigDecimal totalTimeInHours;
    private String description;
    private LocalDate entryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
