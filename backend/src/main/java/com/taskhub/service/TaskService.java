package com.taskhub.service;

import com.taskhub.dto.TaskCreateRequest;
import com.taskhub.dto.TaskResponse;
import com.taskhub.dto.TaskUpdateRequest;
import com.taskhub.entity.Task;
import com.taskhub.entity.Task.Priority;
import com.taskhub.repository.TaskRepository;
import com.taskhub.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public Task createTask(Long userId, TaskCreateRequest req) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }

        Priority priority = parsePriority(req.getPriority());

        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .userId(userId)
                .categoryId(req.getCategoryId())
                .priority(priority)
                .dueDate(req.getDueDate())
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created: id={} for userId={}", saved.getId(), userId);
        return saved;
    }

    public List<Task> getUserTasks(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    public Optional<Task> getTaskById(Long taskId, Long userId) {
        return taskRepository.findByIdAndUserId(taskId, userId);
    }

    @Transactional
    public Task updateTask(Long taskId, Long userId, TaskUpdateRequest req) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        if (req.getTitle() != null) {
            task.setTitle(req.getTitle());
        }
        if (req.getDescription() != null) {
            task.setDescription(req.getDescription());
        }
        if (req.getCategoryId() != null) {
            task.setCategoryId(req.getCategoryId());
        }
        if (req.getPriority() != null) {
            task.setPriority(parsePriority(req.getPriority()));
        }
        if (req.getDueDate() != null) {
            task.setDueDate(req.getDueDate());
        }
        if (req.getIsCompleted() != null) {
            task.setCompleted(req.getIsCompleted());
        }

        Task updated = taskRepository.save(task);
        log.info("Task updated: id={} for userId={}", taskId, userId);
        return updated;
    }

    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        if (taskRepository.findByIdAndUserId(taskId, userId).isEmpty()) {
            throw new EntityNotFoundException("Task not found with id: " + taskId);
        }
        taskRepository.deleteByIdAndUserId(taskId, userId);
        log.info("Task deleted: id={} for userId={}", taskId, userId);
    }

    @Transactional
    public Task completeTask(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        task.setCompleted(true);
        Task completed = taskRepository.save(task);
        log.info("Task completed: id={} for userId={}", taskId, userId);
        return completed;
    }

    public TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .userId(task.getUserId())
                .categoryId(task.getCategoryId())
                .priority(task.getPriority().name())
                .dueDate(task.getDueDate())
                .isCompleted(task.isCompleted())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private Priority parsePriority(String priority) {
        if (priority == null) return Priority.MEDIUM;
        try {
            return Priority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid priority value: " + priority + ". Must be LOW, MEDIUM, or HIGH.");
        }
    }
}
