package com.taskhub.repository;

import com.taskhub.entity.Task;
import com.taskhub.entity.Task.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserId(Long userId);

    List<Task> findByUserIdAndIsCompletedFalse(Long userId);

    List<Task> findByUserIdAndPriority(Long userId, Priority priority);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndIsCompleted(Long userId, Boolean isCompleted);

    long countByUserIdAndIsCompletedFalse(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    long countByUserIdAndCreatedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    // uses updatedAt as proxy for completion date since Task has no completedAt column
    @Query("SELECT COUNT(t) FROM Task t WHERE t.userId = ?1 AND t.isCompleted = true AND t.updatedAt BETWEEN ?2 AND ?3")
    long countByUserIdAndCompletedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}
