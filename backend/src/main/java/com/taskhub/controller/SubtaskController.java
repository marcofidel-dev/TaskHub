package com.taskhub.controller;

import com.taskhub.dto.*;
import com.taskhub.entity.Subtask;
import com.taskhub.security.CurrentUser;
import com.taskhub.service.SubtaskService;
import com.taskhub.service.SubtaskStats;
import com.taskhub.service.FeatureAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tasks/{taskId}/subtasks")
@RequiredArgsConstructor
public class SubtaskController {

    private final SubtaskService subtaskService;
    private final FeatureAccessService featureAccessService;

    @PostMapping
    public ResponseEntity<SubtaskResponse> createSubtask(
            @PathVariable Long taskId,
            @CurrentUser Long userId,
            @Valid @RequestBody SubtaskRequest request) {

        if (!featureAccessService.canUseFeature(userId, "subtasks")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Subtask subtask = subtaskService.createSubtask(
            taskId, userId,
            request.getTitle(), request.getDescription(), request.getOrderIndex()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(subtask));
    }

    @GetMapping
    public ResponseEntity<SubtaskListResponse> getSubtasks(
            @PathVariable Long taskId,
            @CurrentUser Long userId) {

        if (!featureAccessService.canUseFeature(userId, "subtasks")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Subtask> subtasks = subtaskService.getSubtasksByTask(taskId);
        SubtaskStats stats = subtaskService.getSubtaskStats(taskId);

        return ResponseEntity.ok(SubtaskListResponse.builder()
            .taskId(taskId)
            .total(stats.getTotal().intValue())
            .completed(stats.getCompleted().intValue())
            .remaining(stats.getRemaining())
            .completionPercentage(stats.getPercentage())
            .subtasks(subtasks.stream().map(this::mapToResponse).collect(Collectors.toList()))
            .build());
    }

    @PutMapping("/{subtaskId}")
    public ResponseEntity<SubtaskResponse> updateSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @CurrentUser Long userId,
            @Valid @RequestBody SubtaskRequest request) {

        if (!featureAccessService.canUseFeature(userId, "subtasks")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Subtask subtask = subtaskService.updateSubtask(
            subtaskId, userId,
            request.getTitle(), request.getDescription(), null, request.getOrderIndex()
        );

        return ResponseEntity.ok(mapToResponse(subtask));
    }

    @PatchMapping("/{subtaskId}/toggle")
    public ResponseEntity<SubtaskResponse> toggleSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @CurrentUser Long userId) {

        if (!featureAccessService.canUseFeature(userId, "subtasks")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(mapToResponse(subtaskService.toggleSubtask(subtaskId, userId)));
    }

    @DeleteMapping("/{subtaskId}")
    public ResponseEntity<Void> deleteSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @CurrentUser Long userId) {

        if (!featureAccessService.canUseFeature(userId, "subtasks")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        subtaskService.deleteSubtask(subtaskId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<SubtaskListResponse> reorderSubtasks(
            @PathVariable Long taskId,
            @CurrentUser Long userId,
            @Valid @RequestBody ReorderSubtasksRequest request) {

        if (!featureAccessService.canUseFeature(userId, "subtasks")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        subtaskService.reorderSubtasks(taskId, request.getSubtaskIds(), userId);

        List<Subtask> subtasks = subtaskService.getSubtasksByTask(taskId);
        SubtaskStats stats = subtaskService.getSubtaskStats(taskId);

        return ResponseEntity.ok(SubtaskListResponse.builder()
            .taskId(taskId)
            .total(stats.getTotal().intValue())
            .completed(stats.getCompleted().intValue())
            .remaining(stats.getRemaining())
            .completionPercentage(stats.getPercentage())
            .subtasks(subtasks.stream().map(this::mapToResponse).collect(Collectors.toList()))
            .build());
    }

    private SubtaskResponse mapToResponse(Subtask subtask) {
        return SubtaskResponse.builder()
            .id(subtask.getId())
            .taskId(subtask.getTaskId())
            .title(subtask.getTitle())
            .description(subtask.getDescription())
            .completed(subtask.getCompleted())
            .orderIndex(subtask.getOrderIndex())
            .createdAt(subtask.getCreatedAt())
            .updatedAt(subtask.getUpdatedAt())
            .build();
    }
}
