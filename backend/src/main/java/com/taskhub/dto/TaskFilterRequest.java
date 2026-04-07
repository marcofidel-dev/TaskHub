package com.taskhub.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskFilterRequest {

    private Long categoryId;
    private Long tagId;
    private String priority;
    private Boolean isCompleted;
    private LocalDateTime dueDateFrom;
    private LocalDateTime dueDateTo;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortOrder = "DESC";
}
