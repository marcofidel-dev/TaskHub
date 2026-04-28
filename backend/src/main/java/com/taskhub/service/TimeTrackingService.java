package com.taskhub.service;

import com.taskhub.entity.TaskTimeEntry;
import com.taskhub.repository.TaskTimeEntryRepository;
import com.taskhub.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TimeTrackingService {

    private final TaskTimeEntryRepository timeEntryRepository;

    public TaskTimeEntry createTimeEntry(Long taskId, Long userId, BigDecimal hours,
                                         Integer minutes, String description, LocalDate entryDate) {
        TaskTimeEntry entry = TaskTimeEntry.builder()
            .taskId(taskId)
            .userId(userId)
            .hours(hours)
            .minutes(minutes != null ? minutes : 0)
            .description(description != null ? SecurityUtil.sanitizeHtml(description) : null)
            .entryDate(entryDate != null ? entryDate : LocalDate.now())
            .build();

        return timeEntryRepository.save(entry);
    }

    public TaskTimeEntry updateTimeEntry(Long entryId, Long requestingUserId,
                                          BigDecimal hours, Integer minutes, String description) {
        TaskTimeEntry entry = timeEntryRepository.findById(entryId)
            .orElseThrow(() -> new RuntimeException("Time entry not found"));

        if (!entry.getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Not authorized to update this time entry");
        }

        entry.setHours(hours);
        entry.setMinutes(minutes != null ? minutes : 0);
        entry.setDescription(description != null ? SecurityUtil.sanitizeHtml(description) : null);

        return timeEntryRepository.save(entry);
    }

    public void deleteTimeEntry(Long entryId, Long requestingUserId) {
        TaskTimeEntry entry = timeEntryRepository.findById(entryId)
            .orElseThrow(() -> new RuntimeException("Time entry not found"));

        if (!entry.getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Not authorized to delete this time entry");
        }

        timeEntryRepository.delete(entry);
    }

    @Transactional(readOnly = true)
    public List<TaskTimeEntry> getTimeEntriesByTask(Long taskId) {
        return timeEntryRepository.findByTaskId(taskId);
    }

    @Transactional(readOnly = true)
    public List<TaskTimeEntry> getTimeEntriesByUser(Long userId) {
        return timeEntryRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalHoursByTask(Long taskId) {
        return timeEntryRepository.getTotalHoursByTask(taskId);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalHoursByUserInRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return timeEntryRepository.getTotalHoursByUserAndDateRange(userId, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<TaskTimeEntry> getTimeEntriesInRange(Long taskId, LocalDate startDate, LocalDate endDate) {
        return timeEntryRepository.findByTaskIdAndDateRange(taskId, startDate, endDate);
    }
}
