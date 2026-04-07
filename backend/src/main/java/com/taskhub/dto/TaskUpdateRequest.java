package com.taskhub.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TaskUpdateRequest {

    private String title;

    private String description;

    private Long categoryId;

    private String priority;

    private LocalDateTime dueDate;

    private Boolean isCompleted;
}
