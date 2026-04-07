package com.taskhub.service;

import com.taskhub.dto.TaskCreateRequest;
import com.taskhub.dto.TaskFilterRequest;
import com.taskhub.dto.TaskResponseWithDetails;
import com.taskhub.dto.TaskUpdateRequest;
import com.taskhub.entity.Category;
import com.taskhub.entity.Tag;
import com.taskhub.entity.Task;
import com.taskhub.entity.Task.Priority;
import com.taskhub.repository.CategoryRepository;
import com.taskhub.repository.TagRepository;
import com.taskhub.repository.TaskRepository;
import com.taskhub.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private TaskService taskService;

    private static final Long USER_ID = 1L;
    private static final Long TASK_ID = 10L;

    private Task buildTask(Long id, Long userId, Priority priority, boolean completed, Long categoryId) {
        return Task.builder()
                .id(id)
                .title("Task " + id)
                .description("Description " + id)
                .userId(userId)
                .categoryId(categoryId)
                .priority(priority)
                .isCompleted(completed)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ── createTask ────────────────────────────────────────────────────────────

    @Test
    void testCreateTask_Success() {
        when(userRepository.existsById(USER_ID)).thenReturn(true);

        Task saved = buildTask(TASK_ID, USER_ID, Priority.MEDIUM, false, null);
        when(taskRepository.save(any(Task.class))).thenReturn(saved);

        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("New Task");
        req.setDescription("Desc");
        req.setPriority("MEDIUM");

        Task result = taskService.createTask(USER_ID, req);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(TASK_ID);
        assertThat(result.getUserId()).isEqualTo(USER_ID);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void testCreateTask_UserNotFound() {
        when(userRepository.existsById(USER_ID)).thenReturn(false);

        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("Task");

        assertThatThrownBy(() -> taskService.createTask(USER_ID, req))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(taskRepository, never()).save(any());
    }

    @Test
    void testCreateTask_WithCategoryAndTags() {
        when(userRepository.existsById(USER_ID)).thenReturn(true);

        Tag tag1 = Tag.builder().id(1L).name("urgent").color("#FF0000").userId(USER_ID).build();
        Tag tag2 = Tag.builder().id(2L).name("work").color("#0000FF").userId(USER_ID).build();
        when(tagRepository.findByIdInAndUserId(List.of(1L, 2L), USER_ID))
                .thenReturn(List.of(tag1, tag2));

        Task saved = buildTask(TASK_ID, USER_ID, Priority.HIGH, false, 5L);
        saved.setTags(List.of(tag1, tag2));
        when(taskRepository.save(any(Task.class))).thenReturn(saved);

        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("Tagged Task");
        req.setCategoryId(5L);
        req.setPriority("HIGH");
        req.setTagIds(List.of(1L, 2L));

        Task result = taskService.createTask(USER_ID, req);

        assertThat(result.getCategoryId()).isEqualTo(5L);
        assertThat(result.getTags()).hasSize(2);
        verify(tagRepository).findByIdInAndUserId(List.of(1L, 2L), USER_ID);
    }

    // ── getTaskById ───────────────────────────────────────────────────────────

    @Test
    void testGetTaskById_Success() {
        Task task = buildTask(TASK_ID, USER_ID, Priority.MEDIUM, false, null);
        when(taskRepository.findByIdAndUserId(TASK_ID, USER_ID)).thenReturn(Optional.of(task));

        Optional<Task> result = taskService.getTaskById(TASK_ID, USER_ID);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(TASK_ID);
    }

    @Test
    void testGetTaskById_NotFound() {
        when(taskRepository.findByIdAndUserId(TASK_ID, USER_ID)).thenReturn(Optional.empty());

        Optional<Task> result = taskService.getTaskById(TASK_ID, USER_ID);

        assertThat(result).isEmpty();
    }

    @Test
    void testGetTaskById_DifferentUser() {
        Long otherUserId = 99L;
        when(taskRepository.findByIdAndUserId(TASK_ID, otherUserId)).thenReturn(Optional.empty());

        Optional<Task> result = taskService.getTaskById(TASK_ID, otherUserId);

        assertThat(result).isEmpty();
    }

    // ── updateTask ────────────────────────────────────────────────────────────

    @Test
    void testUpdateTask_Success() {
        Task existing = buildTask(TASK_ID, USER_ID, Priority.LOW, false, null);
        when(taskRepository.findByIdAndUserId(TASK_ID, USER_ID)).thenReturn(Optional.of(existing));

        Task updated = buildTask(TASK_ID, USER_ID, Priority.HIGH, true, null);
        updated.setTitle("Updated Title");
        when(taskRepository.save(any(Task.class))).thenReturn(updated);

        TaskUpdateRequest req = new TaskUpdateRequest();
        req.setTitle("Updated Title");
        req.setPriority("HIGH");
        req.setIsCompleted(true);

        Task result = taskService.updateTask(TASK_ID, USER_ID, req);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getPriority()).isEqualTo(Priority.HIGH);
        verify(taskRepository).save(existing);
    }

    // ── deleteTask ────────────────────────────────────────────────────────────

    @Test
    void testDeleteTask_Success() {
        Task task = buildTask(TASK_ID, USER_ID, Priority.MEDIUM, false, null);
        when(taskRepository.findByIdAndUserId(TASK_ID, USER_ID)).thenReturn(Optional.of(task));
        doNothing().when(taskRepository).deleteByIdAndUserId(TASK_ID, USER_ID);

        taskService.deleteTask(TASK_ID, USER_ID);

        verify(taskRepository).deleteByIdAndUserId(TASK_ID, USER_ID);
    }

    // ── filterTasks ───────────────────────────────────────────────────────────

    @Test
    void testFilterTasks_ByCategoryId() {
        when(userRepository.existsById(USER_ID)).thenReturn(true);

        Task taskA = buildTask(1L, USER_ID, Priority.MEDIUM, false, 10L);
        Task taskB = buildTask(2L, USER_ID, Priority.HIGH, false, 20L);
        Task taskC = buildTask(3L, USER_ID, Priority.LOW, false, 10L);
        when(taskRepository.findByUserId(USER_ID)).thenReturn(List.of(taskA, taskB, taskC));

        TaskFilterRequest filters = TaskFilterRequest.builder()
                .categoryId(10L)
                .sortBy("createdAt")
                .sortOrder("DESC")
                .build();

        List<Task> result = taskService.filterTasks(USER_ID, filters);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(t -> t.getCategoryId().equals(10L));
    }

    @Test
    void testFilterTasks_ByPriority() {
        when(userRepository.existsById(USER_ID)).thenReturn(true);

        Task low = buildTask(1L, USER_ID, Priority.LOW, false, null);
        Task med = buildTask(2L, USER_ID, Priority.MEDIUM, false, null);
        Task high = buildTask(3L, USER_ID, Priority.HIGH, false, null);
        when(taskRepository.findByUserId(USER_ID)).thenReturn(List.of(low, med, high));

        TaskFilterRequest filters = TaskFilterRequest.builder()
                .priority("HIGH")
                .sortBy("createdAt")
                .sortOrder("DESC")
                .build();

        List<Task> result = taskService.filterTasks(USER_ID, filters);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPriority()).isEqualTo(Priority.HIGH);
    }

    @Test
    void testFilterTasks_ByCompleted() {
        when(userRepository.existsById(USER_ID)).thenReturn(true);

        Task done1 = buildTask(1L, USER_ID, Priority.MEDIUM, true, null);
        Task done2 = buildTask(2L, USER_ID, Priority.HIGH, true, null);
        Task pending = buildTask(3L, USER_ID, Priority.LOW, false, null);
        when(taskRepository.findByUserId(USER_ID)).thenReturn(List.of(done1, done2, pending));

        TaskFilterRequest filters = TaskFilterRequest.builder()
                .isCompleted(true)
                .sortBy("createdAt")
                .sortOrder("DESC")
                .build();

        List<Task> result = taskService.filterTasks(USER_ID, filters);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(Task::isCompleted);
    }

    @Test
    void testFilterTasks_MultipleFilters() {
        when(userRepository.existsById(USER_ID)).thenReturn(true);

        Task t1 = buildTask(1L, USER_ID, Priority.HIGH, false, 10L);
        Task t2 = buildTask(2L, USER_ID, Priority.LOW, false, 10L);
        Task t3 = buildTask(3L, USER_ID, Priority.HIGH, false, 20L);
        Task t4 = buildTask(4L, USER_ID, Priority.HIGH, true, 10L);
        when(taskRepository.findByUserId(USER_ID)).thenReturn(List.of(t1, t2, t3, t4));

        TaskFilterRequest filters = TaskFilterRequest.builder()
                .categoryId(10L)
                .priority("HIGH")
                .isCompleted(false)
                .sortBy("createdAt")
                .sortOrder("DESC")
                .build();

        List<Task> result = taskService.filterTasks(USER_ID, filters);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void testFilterTasks_WithSorting() {
        when(userRepository.existsById(USER_ID)).thenReturn(true);

        LocalDateTime base = LocalDateTime.of(2024, 1, 1, 0, 0);
        Task t1 = Task.builder()
                .id(1L).title("Alpha").userId(USER_ID).priority(Priority.LOW)
                .createdAt(base).updatedAt(base).build();
        Task t2 = Task.builder()
                .id(2L).title("Beta").userId(USER_ID).priority(Priority.MEDIUM)
                .createdAt(base.plusDays(1)).updatedAt(base.plusDays(1)).build();
        Task t3 = Task.builder()
                .id(3L).title("Gamma").userId(USER_ID).priority(Priority.HIGH)
                .createdAt(base.plusDays(2)).updatedAt(base.plusDays(2)).build();
        when(taskRepository.findByUserId(USER_ID)).thenReturn(List.of(t2, t3, t1));

        // Sort by title ASC
        TaskFilterRequest filters = TaskFilterRequest.builder()
                .sortBy("title")
                .sortOrder("ASC")
                .build();

        List<Task> result = taskService.filterTasks(USER_ID, filters);

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getTitle()).isEqualTo("Alpha");
        assertThat(result.get(1).getTitle()).isEqualTo("Beta");
        assertThat(result.get(2).getTitle()).isEqualTo("Gamma");
    }
}
