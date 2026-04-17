package com.taskhub.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.taskhub.config.LocalDateTimeDeserializer;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class TaskUpdateRequest {

    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private Long categoryId;

    @Pattern(regexp = "^(LOW|MEDIUM|HIGH)$",
             message = "Priority must be LOW, MEDIUM, or HIGH")
    private String priority;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime dueDate;

    private Boolean isCompleted;

    // When provided, replaces all current tags on the task.
    // Send empty list [] to clear all tags.
    private List<Long> tagIds;
}
