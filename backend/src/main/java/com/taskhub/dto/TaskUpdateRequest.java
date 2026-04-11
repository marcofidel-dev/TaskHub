package com.taskhub.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.taskhub.config.LocalDateTimeDeserializer;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class TaskUpdateRequest {

    private String title;

    private String description;

    private Long categoryId;

    private String priority;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime dueDate;

    private Boolean isCompleted;

    // When provided, replaces all current tags on the task.
    // Send empty list [] to clear all tags.
    private List<Long> tagIds;
}
