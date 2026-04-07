package com.taskhub.repository;

import com.taskhub.entity.Task;
import com.taskhub.entity.Task.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserId(Long userId);

    List<Task> findByUserIdAndIsCompletedFalse(Long userId);

    List<Task> findByUserIdAndPriority(Long userId, Priority priority);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndIsCompletedFalse(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
