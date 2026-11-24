package com.taskhub.service;

import com.taskhub.entity.Subtask;
import com.taskhub.repository.SubtaskRepository;
import com.taskhub.repository.TaskRepository;
import com.taskhub.security.SecurityUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;

    /** Fails with EntityNotFoundException (404) unless the task exists AND belongs to userId. */
    private void requireOwnedTask(Long taskId, Long userId) {
        if (taskRepository.findByIdAndUserId(taskId, userId).isEmpty()) {
            throw new EntityNotFoundException("Task not found with id: " + taskId);
        }
    }

    public Subtask createSubtask(Long taskId, Long userId, String title, String description, Integer orderIndex) {
        requireOwnedTask(taskId, userId);
        Subtask subtask = Subtask.builder()
            .taskId(taskId)
            .userId(userId)
            .title(SecurityUtil.sanitizeHtml(title))
            .description(SecurityUtil.sanitizeHtml(description))
            .completed(false)
            .orderIndex(orderIndex != null ? orderIndex : 0)
            .build();

        return subtaskRepository.save(subtask);
    }

    public Subtask updateSubtask(Long subtaskId, Long userId, String title, String description, Boolean completed, Integer orderIndex) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
            .orElseThrow(() -> new RuntimeException("Subtask not found"));

        if (!subtask.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot edit another user's subtask");
        }

        if (title != null) subtask.setTitle(SecurityUtil.sanitizeHtml(title));
        if (description != null) subtask.setDescription(SecurityUtil.sanitizeHtml(description));
        if (completed != null) subtask.setCompleted(completed);
        if (orderIndex != null) subtask.setOrderIndex(orderIndex);

        return subtaskRepository.save(subtask);
    }

    public Subtask toggleSubtask(Long subtaskId, Long userId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
            .orElseThrow(() -> new RuntimeException("Subtask not found"));

        if (!subtask.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        subtask.setCompleted(!subtask.getCompleted());
        return subtaskRepository.save(subtask);
    }

    public void deleteSubtask(Long subtaskId, Long userId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
            .orElseThrow(() -> new RuntimeException("Subtask not found"));

        if (!subtask.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        subtaskRepository.deleteById(subtaskId);
    }

    @Transactional(readOnly = true)
    public List<Subtask> getSubtasksByTask(Long taskId, Long userId) {
        requireOwnedTask(taskId, userId);
        return subtaskRepository.findByTaskIdOrderByOrderIndex(taskId);
    }

    @Transactional(readOnly = true)
    public Double getCompletionPercentage(Long taskId, Long userId) {
        requireOwnedTask(taskId, userId);
        return subtaskRepository.getCompletionPercentage(taskId);
    }

    @Transactional(readOnly = true)
    public SubtaskStats getSubtaskStats(Long taskId, Long userId) {
        requireOwnedTask(taskId, userId);
        long total = subtaskRepository.countByTaskId(taskId);
        long completed = subtaskRepository.countByTaskIdAndCompleted(taskId, true);
        Double percentage = total > 0 ? (double) (completed * 100 / total) : 0.0;

        return SubtaskStats.builder()
            .total(total)
            .completed(completed)
            .remaining((int) (total - completed))
            .percentage(percentage)
            .build();
    }

    public void reorderSubtasks(Long taskId, List<Long> subtaskIds, Long userId) {
        requireOwnedTask(taskId, userId);
        for (int i = 0; i < subtaskIds.size(); i++) {
            Subtask subtask = subtaskRepository.findById(subtaskIds.get(i))
                .orElseThrow(() -> new RuntimeException("Subtask not found"));

            if (!subtask.getTaskId().equals(taskId) || !subtask.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }

            subtask.setOrderIndex(i);
            subtaskRepository.save(subtask);
        }
    }
}
