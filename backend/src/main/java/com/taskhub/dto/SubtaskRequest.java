package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Integer orderIndex;
}
