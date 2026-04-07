package com.taskhub.service;

import com.taskhub.dto.*;
import com.taskhub.entity.Tag;
import com.taskhub.entity.Task;
import com.taskhub.entity.Task.Priority;
import com.taskhub.repository.CategoryRepository;
import com.taskhub.repository.TagRepository;
import com.taskhub.repository.TaskRepository;
import com.taskhub.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

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

        if (req.getTagIds() != null && !req.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepository.findByIdInAndUserId(req.getTagIds(), userId);
            task.setTags(tags);
        }

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

    public List<Task> filterTasks(Long userId, TaskFilterRequest filters) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }

        Stream<Task> stream = taskRepository.findByUserId(userId).stream();

        if (filters.getCategoryId() != null) {
            stream = stream.filter(t -> filters.getCategoryId().equals(t.getCategoryId()));
        }
        if (filters.getTagId() != null) {
            stream = stream.filter(t -> t.getTags().stream()
                    .anyMatch(tag -> filters.getTagId().equals(tag.getId())));
        }
        if (filters.getPriority() != null) {
            Priority p = parsePriority(filters.getPriority());
            stream = stream.filter(t -> p.equals(t.getPriority()));
        }
        if (filters.getIsCompleted() != null) {
            stream = stream.filter(t -> filters.getIsCompleted().equals(t.isCompleted()));
        }
        if (filters.getDueDateFrom() != null) {
            stream = stream.filter(t -> t.getDueDate() != null
                    && !t.getDueDate().isBefore(filters.getDueDateFrom()));
        }
        if (filters.getDueDateTo() != null) {
            stream = stream.filter(t -> t.getDueDate() != null
                    && !t.getDueDate().isAfter(filters.getDueDateTo()));
        }

        String sortBy = filters.getSortBy() != null ? filters.getSortBy() : "createdAt";
        boolean descending = !"ASC".equalsIgnoreCase(filters.getSortOrder());
        Comparator<Task> comparator = buildComparator(sortBy, descending);

        return stream.sorted(comparator).collect(Collectors.toList());
    }

    public TaskResponseWithDetails mapToDetailedResponse(Task task) {
        CategoryResponse categoryResponse = null;
        if (task.getCategoryId() != null) {
            categoryResponse = categoryRepository.findByIdAndUserId(task.getCategoryId(), task.getUserId())
                    .map(cat -> CategoryResponse.builder()
                            .id(cat.getId())
                            .name(cat.getName())
                            .description(cat.getDescription())
                            .color(cat.getColor())
                            .createdAt(cat.getCreatedAt())
                            .updatedAt(cat.getUpdatedAt())
                            .build())
                    .orElse(null);
        }

        List<TagResponse> tagResponses = task.getTags().stream()
                .map(tag -> TagResponse.builder()
                        .id(tag.getId())
                        .name(tag.getName())
                        .color(tag.getColor())
                        .createdAt(tag.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return TaskResponseWithDetails.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .userId(task.getUserId())
                .categoryId(task.getCategoryId())
                .priority(task.getPriority().name())
                .dueDate(task.getDueDate())
                .isCompleted(task.isCompleted())
                .category(categoryResponse)
                .tags(tagResponses)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
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

    public Priority parsePriority(String priority) {
        if (priority == null) return Priority.MEDIUM;
        try {
            return Priority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid priority value: " + priority + ". Must be LOW, MEDIUM, or HIGH.");
        }
    }

    private Comparator<Task> buildComparator(String sortBy, boolean descending) {
        Comparator<Task> comp = switch (sortBy.toLowerCase()) {
            case "duedate" -> Comparator.comparing(Task::getDueDate,
                    Comparator.nullsLast(Comparator.naturalOrder()));
            case "priority" -> (t1, t2) -> Integer.compare(
                    t1.getPriority().ordinal(), t2.getPriority().ordinal());
            case "title" -> Comparator.comparing(Task::getTitle,
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            default -> Comparator.comparing(Task::getCreatedAt,
                    Comparator.nullsLast(Comparator.naturalOrder()));
        };
        return descending ? comp.reversed() : comp;
    }
}
