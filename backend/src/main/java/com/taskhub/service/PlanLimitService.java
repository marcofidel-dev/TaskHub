package com.taskhub.service;

import com.taskhub.dto.UserLimitsResponse;
import com.taskhub.exception.PlanLimitExceededException;
import com.taskhub.repository.CategoryRepository;
import com.taskhub.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlanLimitService {

    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
    private final PlanService planService;

    private static final int FREE_TASK_LIMIT = 5;
    private static final int FREE_CATEGORY_LIMIT = 2;
    private static final int UNLIMITED = -1;

    public void validateTaskLimit(Long userId) {
        String plan = planService.getPlanForUser(userId);
        if ("PRO".equals(plan) || "TEAM".equals(plan)) return;

        long current = taskRepository.countByUserId(userId);
        if (current >= FREE_TASK_LIMIT) {
            throw new PlanLimitExceededException("TASKS", (int) current, FREE_TASK_LIMIT, "FREE", "PRO");
        }
    }

    public void validateCategoryLimit(Long userId) {
        String plan = planService.getPlanForUser(userId);
        if ("PRO".equals(plan) || "TEAM".equals(plan)) return;

        long current = categoryRepository.countByUserId(userId);
        if (current >= FREE_CATEGORY_LIMIT) {
            throw new PlanLimitExceededException("CATEGORIES", (int) current, FREE_CATEGORY_LIMIT, "FREE", "PRO");
        }
    }

    public UserLimitsResponse getUserLimits(Long userId) {
        String plan = planService.getPlanForUser(userId);
        boolean isPaid = "PRO".equals(plan) || "TEAM".equals(plan);

        long currentTasks = taskRepository.countByUserId(userId);
        long currentCategories = categoryRepository.countByUserId(userId);

        int tasksLimit = isPaid ? UNLIMITED : FREE_TASK_LIMIT;
        int categoriesLimit = isPaid ? UNLIMITED : FREE_CATEGORY_LIMIT;

        double tasksPercentage = tasksLimit > 0 ? Math.min((double) currentTasks * 100 / tasksLimit, 100.0) : 0;
        double categoriesPercentage = categoriesLimit > 0 ? Math.min((double) currentCategories * 100 / categoriesLimit, 100.0) : 0;

        return UserLimitsResponse.builder()
            .plan(plan)
            .tasksCurrent((int) currentTasks)
            .tasksLimit(tasksLimit)
            .tasksPercentage(tasksPercentage)
            .categoriesCurrent((int) currentCategories)
            .categoriesLimit(categoriesLimit)
            .categoriesPercentage(categoriesPercentage)
            .timeTrackingLimit(isPaid ? UNLIMITED : 0)
            .subtasksLimit(isPaid ? UNLIMITED : 0)
            .analyticsEnabled(isPaid)
            .exportEnabled(isPaid)
            .collaborationEnabled("TEAM".equals(plan))
            .build();
    }
}
