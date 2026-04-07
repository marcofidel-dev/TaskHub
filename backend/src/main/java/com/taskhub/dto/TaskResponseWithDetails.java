package com.taskhub.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponseWithDetails {

    private Long id;
    private String title;
    private String description;
    private Long userId;
    private Long categoryId;
    private String priority;
    private LocalDateTime dueDate;
    private boolean isCompleted;
    private CategoryResponse category;
    private List<TagResponse> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
