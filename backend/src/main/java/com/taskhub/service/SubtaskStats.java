package com.taskhub.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskStats {
    private Long total;
    private Long completed;
    private Integer remaining;
    private Double percentage;
}
