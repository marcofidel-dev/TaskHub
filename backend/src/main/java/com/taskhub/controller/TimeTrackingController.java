package com.taskhub.controller;

import com.taskhub.dto.TaskTimeTrackingResponse;
import com.taskhub.dto.TimeEntryRequest;
import com.taskhub.dto.TimeEntryResponse;
import com.taskhub.entity.TaskTimeEntry;
import com.taskhub.security.CurrentUser;
import com.taskhub.service.FeatureAccessService;
import com.taskhub.service.TimeTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tasks/{taskId}/time-entries")
@RequiredArgsConstructor
public class TimeTrackingController {

    private final TimeTrackingService timeTrackingService;
    private final FeatureAccessService featureAccessService;

    @PostMapping
    public ResponseEntity<TimeEntryResponse> createTimeEntry(
            @PathVariable Long taskId,
            @CurrentUser Long userId,
            @Valid @RequestBody TimeEntryRequest request) {

        if (!featureAccessService.canUseFeature(userId, "time_tracking")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TaskTimeEntry entry = timeTrackingService.createTimeEntry(
            taskId, userId,
            request.getHours(), request.getMinutes(),
            request.getDescription(), request.getEntryDate()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(entry));
    }

    @GetMapping
    public ResponseEntity<TaskTimeTrackingResponse> getTimeEntries(
            @PathVariable Long taskId,
            @CurrentUser Long userId) {

        if (!featureAccessService.canUseFeature(userId, "time_tracking")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<TaskTimeEntry> entries = timeTrackingService.getTimeEntriesByTask(taskId);
        BigDecimal totalHours = timeTrackingService.getTotalHoursByTask(taskId);

        TaskTimeTrackingResponse response = TaskTimeTrackingResponse.builder()
            .taskId(taskId)
            .totalHours(totalHours)
            .totalMinutes(0)
            .entries(entries.stream().map(this::mapToResponse).collect(Collectors.toList()))
            .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{entryId}")
    public ResponseEntity<TimeEntryResponse> updateTimeEntry(
            @PathVariable Long taskId,
            @PathVariable Long entryId,
            @CurrentUser Long userId,
            @Valid @RequestBody TimeEntryRequest request) {

        if (!featureAccessService.canUseFeature(userId, "time_tracking")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TaskTimeEntry entry = timeTrackingService.updateTimeEntry(
            entryId, userId,
            request.getHours(), request.getMinutes(),
            request.getDescription()
        );

        return ResponseEntity.ok(mapToResponse(entry));
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteTimeEntry(
            @PathVariable Long taskId,
            @PathVariable Long entryId,
            @CurrentUser Long userId) {

        if (!featureAccessService.canUseFeature(userId, "time_tracking")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        timeTrackingService.deleteTimeEntry(entryId, userId);
        return ResponseEntity.noContent().build();
    }

    private TimeEntryResponse mapToResponse(TaskTimeEntry entry) {
        return TimeEntryResponse.builder()
            .id(entry.getId())
            .taskId(entry.getTaskId())
            .hours(entry.getHours())
            .minutes(entry.getMinutes())
            .totalTimeInHours(entry.getTotalTimeInHours())
            .description(entry.getDescription())
            .entryDate(entry.getEntryDate())
            .createdAt(entry.getCreatedAt())
            .updatedAt(entry.getUpdatedAt())
            .build();
    }
}
