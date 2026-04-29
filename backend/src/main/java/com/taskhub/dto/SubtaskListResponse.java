package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskListResponse {

    private Long taskId;
    private Integer total;
    private Integer completed;
    private Integer remaining;
    private Double completionPercentage;
    private List<SubtaskResponse> subtasks;
}
