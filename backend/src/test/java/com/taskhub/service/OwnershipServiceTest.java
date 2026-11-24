package com.taskhub.service;

import com.taskhub.entity.Task;
import com.taskhub.repository.SubtaskRepository;
import com.taskhub.repository.TaskRepository;
import com.taskhub.repository.TaskTimeEntryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** IDOR regression: a user must not touch subtasks/time entries of someone else's task. */
class OwnershipServiceTest {

    private static final Long OWNER = 1L, ATTACKER = 2L, TASK = 10L;

    private TaskRepository taskRepository;
    private SubtaskRepository subtaskRepository;
    private TaskTimeEntryRepository timeEntryRepository;
    private SubtaskService subtaskService;
    private TimeTrackingService timeService;

    @BeforeEach
    void setUp() {
        taskRepository = mock(TaskRepository.class);
        subtaskRepository = mock(SubtaskRepository.class);
        timeEntryRepository = mock(TaskTimeEntryRepository.class);
        subtaskService = new SubtaskService(subtaskRepository, taskRepository);
        timeService = new TimeTrackingService(timeEntryRepository, taskRepository);

        when(taskRepository.findByIdAndUserId(TASK, OWNER)).thenReturn(Optional.of(new Task()));
        when(taskRepository.findByIdAndUserId(TASK, ATTACKER)).thenReturn(Optional.empty());
    }

    // ── Subtasks ──────────────────────────────────────────────────────────────

    @Test
    void createSubtask_onForeignTask_isRejectedAndNothingSaved() {
        assertThrows(EntityNotFoundException.class,
                () -> subtaskService.createSubtask(TASK, ATTACKER, "t", "d", 0));
        verify(subtaskRepository, never()).save(any());
    }

    @Test
    void listSubtasks_onForeignTask_isRejectedAndNothingRead() {
        assertThrows(EntityNotFoundException.class, () -> subtaskService.getSubtasksByTask(TASK, ATTACKER));
        assertThrows(EntityNotFoundException.class, () -> subtaskService.getSubtaskStats(TASK, ATTACKER));
        verifyNoInteractions(subtaskRepository);
    }

    @Test
    void reorderSubtasks_onForeignTask_isRejected() {
        assertThrows(EntityNotFoundException.class,
                () -> subtaskService.reorderSubtasks(TASK, List.of(1L), ATTACKER));
        verifyNoInteractions(subtaskRepository);
    }

    @Test
    void createSubtask_onOwnTask_succeeds() {
        subtaskService.createSubtask(TASK, OWNER, "t", "d", 0);
        verify(subtaskRepository).save(any());
    }

    // ── Time entries ──────────────────────────────────────────────────────────

    @Test
    void createTimeEntry_onForeignTask_isRejectedAndNothingSaved() {
        assertThrows(EntityNotFoundException.class,
                () -> timeService.createTimeEntry(TASK, ATTACKER, BigDecimal.ONE, 0, "d", null));
        verify(timeEntryRepository, never()).save(any());
    }

    @Test
    void listTimeEntries_onForeignTask_isRejectedAndNothingRead() {
        assertThrows(EntityNotFoundException.class, () -> timeService.getTimeEntriesByTask(TASK, ATTACKER));
        assertThrows(EntityNotFoundException.class, () -> timeService.getTotalHoursByTask(TASK, ATTACKER));
        verifyNoInteractions(timeEntryRepository);
    }

    @Test
    void createTimeEntry_onOwnTask_succeeds() {
        timeService.createTimeEntry(TASK, OWNER, BigDecimal.ONE, 0, "d", null);
        verify(timeEntryRepository).save(any());
    }
}
