package com.taskhub.repository;

import com.taskhub.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {

    List<Subtask> findByTaskIdOrderByOrderIndex(Long taskId);

    List<Subtask> findByUserId(Long userId);

    List<Subtask> findByTaskIdAndCompleted(Long taskId, Boolean completed);

    long countByTaskId(Long taskId);

    long countByTaskIdAndCompleted(Long taskId, Boolean completed);

    @Query("SELECT COALESCE(CAST(COUNT(CASE WHEN s.completed = true THEN 1 END) AS FLOAT) / NULLIF(COUNT(*), 0) * 100, 0) FROM Subtask s WHERE s.taskId = ?1")
    Double getCompletionPercentage(Long taskId);
}
