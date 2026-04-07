package com.taskhub.controller;

import com.taskhub.dto.TaskCreateRequest;
import com.taskhub.dto.TaskFilterRequest;
import com.taskhub.dto.TaskResponse;
import com.taskhub.dto.TaskResponseWithDetails;
import com.taskhub.dto.TaskUpdateRequest;
import com.taskhub.entity.Task;
import com.taskhub.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
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

    // POST /api/v1/tasks/create
    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTask(
            @RequestParam Long userId,
            @Valid @RequestBody TaskCreateRequest request) {

        Task task = taskService.createTask(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.mapToResponse(task));
    }

    // GET /api/v1/tasks
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getUserTasks(@RequestParam Long userId) {
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
            @RequestParam Long userId) {

        return taskService.getTaskById(id, userId)
                .map(task -> ResponseEntity.ok(taskService.mapToResponse(task)))
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/v1/tasks/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestParam Long userId,
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
            @RequestParam Long userId) {

        try {
            taskService.deleteTask(id, userId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PATCH /api/v1/tasks/{id}/complete
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> completeTask(
            @PathVariable Long id,
            @RequestParam Long userId) {

        try {
            Task completed = taskService.completeTask(id, userId);
            return ResponseEntity.ok(taskService.mapToResponse(completed));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/v1/tasks/filter
    @GetMapping("/filter")
    public ResponseEntity<List<TaskResponseWithDetails>> filterTasks(
            @RequestParam Long userId,
            @RequestBody(required = false) TaskFilterRequest filters) {

        if (filters == null) {
            filters = new TaskFilterRequest();
        }
        try {
            List<TaskResponseWithDetails> result = taskService.filterTasks(userId, filters)
                    .stream()
                    .map(taskService::mapToDetailedResponse)
                    .toList();
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
