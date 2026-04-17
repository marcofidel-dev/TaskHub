package com.taskhub.controller;

import com.taskhub.dto.ApiErrorResponse;
import com.taskhub.dto.TaskCreateRequest;
import com.taskhub.dto.TaskFilterRequest;
import com.taskhub.dto.TaskResponse;
import com.taskhub.dto.TaskResponseWithDetails;
import com.taskhub.dto.TaskUpdateRequest;
import com.taskhub.entity.Task;
import com.taskhub.security.CurrentUser;
import com.taskhub.security.JwtProvider;
import com.taskhub.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;
    private final JwtProvider jwtProvider;

    // POST /api/v1/tasks/create
    @PostMapping("/create")
    public ResponseEntity<?> createTask(
            @CurrentUser(required = false) Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody TaskCreateRequest req) {

        try {
            // Fallback: extract userId from header if resolver returned null
            if (userId == null && authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                log.warn("[createTask] @CurrentUser returned null — falling back to manual token extraction");
                if (jwtProvider.validateToken(token)) {
                    userId = jwtProvider.getUserIdFromToken(token);
                    log.info("[createTask] Fallback userId: {}", userId);
                }
            }

            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(ApiErrorResponse.builder().status(401).error("UNAUTHORIZED")
                                        .message("Valid JWT token required").timestamp(LocalDateTime.now()).build());
            }

            if (req.getCategoryId() != null && req.getCategoryId() <= 0) {
                req.setCategoryId(null);
            }

            Task task = taskService.createTask(userId, req);
            return ResponseEntity.status(HttpStatus.CREATED).body(taskService.mapToResponse(task));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(
                    ApiErrorResponse.builder().status(400).error("VALIDATION_ERROR")
                            .message(e.getMessage()).timestamp(LocalDateTime.now()).build());
        } catch (Exception e) {
            log.error("Error creating task", e);
            return ResponseEntity.status(500).body(
                    ApiErrorResponse.builder().status(500).error("SERVER_ERROR")
                            .message("Failed to create task").timestamp(LocalDateTime.now()).build());
        }
    }

    // GET /api/v1/tasks
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getUserTasks(@CurrentUser Long userId) {
        List<TaskResponse> tasks = taskService.getUserTasks(userId)
                .stream()
                .map(taskService::mapToResponse)
                .toList();
        return ResponseEntity.ok(tasks);
    }

    // GET /api/v1/tasks/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long id,
            @CurrentUser Long userId) {

        return taskService.getTaskById(id, userId)
                .map(task -> ResponseEntity.ok(taskService.mapToResponse(task)))
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/v1/tasks/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @CurrentUser Long userId,
            @Valid @RequestBody TaskUpdateRequest request) {

        try {
            Task updated = taskService.updateTask(id, userId, request);
            return ResponseEntity.ok(taskService.mapToResponse(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/v1/tasks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @CurrentUser Long userId) {

        try {
            taskService.deleteTask(id, userId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH /api/v1/tasks/{id}/complete
    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeTask(
            @PathVariable Long id,
            @CurrentUser Long userId) {

        try {
            Task completed = taskService.completeTask(id, userId);
            return ResponseEntity.ok(taskService.mapToResponse(completed));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(
                    ApiErrorResponse.builder().status(404).error("NOT_FOUND")
                            .message(e.getMessage()).timestamp(LocalDateTime.now()).build());
        } catch (Exception e) {
            log.error("Error toggling task completion: taskId={} userId={}", id, userId, e);
            return ResponseEntity.status(500).body(
                    ApiErrorResponse.builder().status(500).error("SERVER_ERROR")
                            .message("Failed to update task completion").timestamp(LocalDateTime.now()).build());
        }
    }

    // POST /api/v1/tasks/filter
    @PostMapping("/filter")
    public ResponseEntity<?> filterTasks(
            @CurrentUser Long userId,
            @RequestBody TaskFilterRequest filterRequest) {

        try {
            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(ApiErrorResponse.builder().status(401).error("UNAUTHORIZED")
                                .message("Invalid or missing authentication token")
                                .timestamp(LocalDateTime.now()).build());
            }

            List<TaskResponseWithDetails> tasks = taskService.filterTasks(userId, filterRequest)
                    .stream()
                    .map(taskService::mapToDetailedResponse)
                    .toList();
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            log.error("Error filtering tasks", e);
            return ResponseEntity.status(500).body(
                    ApiErrorResponse.builder().status(500).error("SERVER_ERROR")
                            .message("Failed to filter tasks").timestamp(LocalDateTime.now()).build());
        }
    }
}
