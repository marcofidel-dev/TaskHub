package com.taskhub.repository;

import com.taskhub.entity.TaskTimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskTimeEntryRepository extends JpaRepository<TaskTimeEntry, Long> {

    List<TaskTimeEntry> findByTaskId(Long taskId);

    List<TaskTimeEntry> findByUserId(Long userId);

    List<TaskTimeEntry> findByTaskIdAndUserId(Long taskId, Long userId);

    @Query("SELECT t FROM TaskTimeEntry t WHERE t.taskId = ?1 AND t.entryDate BETWEEN ?2 AND ?3")
    List<TaskTimeEntry> findByTaskIdAndDateRange(Long taskId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT t FROM TaskTimeEntry t WHERE t.userId = ?1 AND t.entryDate BETWEEN ?2 AND ?3")
    List<TaskTimeEntry> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.hours), 0) FROM TaskTimeEntry t WHERE t.taskId = ?1")
    BigDecimal getTotalHoursByTask(Long taskId);

    @Query("SELECT COALESCE(SUM(t.hours), 0) FROM TaskTimeEntry t WHERE t.userId = ?1 AND t.entryDate BETWEEN ?2 AND ?3")
    BigDecimal getTotalHoursByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);
}
