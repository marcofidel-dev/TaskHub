package com.taskhub.service;

import com.taskhub.dto.*;
import com.taskhub.repository.SubtaskRepository;
import com.taskhub.repository.TaskRepository;
import com.taskhub.repository.TaskTimeEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final TaskRepository taskRepository;
    private final TaskTimeEntryRepository timeEntryRepository;
    private final SubtaskRepository subtaskRepository;

    public AnalyticsDashboardResponse getDashboard(Long userId) {
        long totalTasks = taskRepository.countByUserId(userId);
        long completedTasks = taskRepository.countByUserIdAndIsCompleted(userId, true);
        double completionPercentage = totalTasks > 0 ? (double) completedTasks * 100 / totalTasks : 0;

        BigDecimal totalHours = timeEntryRepository.getTotalHoursByUserId(userId);
        if (totalHours == null) totalHours = BigDecimal.ZERO;

        LocalDate startOfWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate today = LocalDate.now();

        long tasksThisWeek = taskRepository.countByUserIdAndCreatedAtBetween(
            userId, startOfWeek.atStartOfDay(), today.plusDays(1).atStartOfDay());
        long completedThisWeek = taskRepository.countByUserIdAndCompletedAtBetween(
            userId, startOfWeek.atStartOfDay(), today.plusDays(1).atStartOfDay());

        LocalDate lastWeekStart = startOfWeek.minusWeeks(1);
        long lastWeekTasks = taskRepository.countByUserIdAndCreatedAtBetween(
            userId, lastWeekStart.atStartOfDay(), startOfWeek.atStartOfDay());
        double weeklyTrend = lastWeekTasks > 0
            ? ((double) tasksThisWeek - lastWeekTasks) / lastWeekTasks * 100 : 0;

        return AnalyticsDashboardResponse.builder()
            .generatedAt(today)
            .totalTasks((int) totalTasks)
            .completedTasks((int) completedTasks)
            .remainingTasks((int) (totalTasks - completedTasks))
            .completionPercentage(completionPercentage)
            .totalHoursTracked(totalHours)
            .totalTimeEntriesCount((int) timeEntryRepository.countByUserId(userId))
            .mostProductiveCategory(getMostProductiveCategory(userId))
            .tasksThisWeek((int) tasksThisWeek)
            .completedThisWeek((int) completedThisWeek)
            .weeklyTrend(weeklyTrend)
            .build();
    }

    public CompletionMetricsResponse getCompletionMetrics(Long userId) {
        long totalTasks = taskRepository.countByUserId(userId);
        long completedTasks = taskRepository.countByUserIdAndIsCompleted(userId, true);
        double completionPercentage = totalTasks > 0 ? (double) completedTasks * 100 / totalTasks : 0;

        return CompletionMetricsResponse.builder()
            .totalTasks((int) totalTasks)
            .completedTasks((int) completedTasks)
            .remainingTasks((int) (totalTasks - completedTasks))
            .completionPercentage(completionPercentage)
            .byCategory(new ArrayList<>())
            .byPriority(new ArrayList<>())
            .build();
    }

    public TimeTrackingAnalyticsResponse getTimeTrackingAnalytics(Long userId) {
        BigDecimal totalHours = timeEntryRepository.getTotalHoursByUserId(userId);
        if (totalHours == null) totalHours = BigDecimal.ZERO;

        long timeEntriesCount = timeEntryRepository.countByUserId(userId);
        long taskCount = taskRepository.countByUserId(userId);

        BigDecimal averageHoursPerTask = BigDecimal.ZERO;
        if (taskCount > 0 && totalHours.compareTo(BigDecimal.ZERO) > 0) {
            averageHoursPerTask = totalHours.divide(new BigDecimal(taskCount), 2, RoundingMode.HALF_UP);
        }

        return TimeTrackingAnalyticsResponse.builder()
            .totalHours(totalHours)
            .totalMinutes(0)
            .timeEntriesCount((int) timeEntriesCount)
            .averageHoursPerTask(averageHoursPerTask)
            .byCategory(new ArrayList<>())
            .byDay(new ArrayList<>())
            .build();
    }

    public CategoryProductivityResponse getCategoryProductivity(Long userId) {
        return CategoryProductivityResponse.builder()
            .categories(new ArrayList<>())
            .build();
    }

    public DateRangeAnalyticsResponse getDateRangeAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        long tasksCreated = taskRepository.countByUserIdAndCreatedAtBetween(
            userId, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        long tasksCompleted = taskRepository.countByUserIdAndCompletedAtBetween(
            userId, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        BigDecimal hoursTracked = timeEntryRepository.getTotalHoursByUserAndDateRange(userId, startDate, endDate);
        if (hoursTracked == null) hoursTracked = BigDecimal.ZERO;

        long daysInRange = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double averageTasksPerDay = daysInRange > 0 ? (double) tasksCreated / daysInRange : 0;

        List<DateRangeAnalyticsResponse.DailyMetrics> dailyData = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            long dailyCreated = taskRepository.countByUserIdAndCreatedAtBetween(
                userId, current.atStartOfDay(), current.plusDays(1).atStartOfDay());
            long dailyCompleted = taskRepository.countByUserIdAndCompletedAtBetween(
                userId, current.atStartOfDay(), current.plusDays(1).atStartOfDay());

            dailyData.add(DateRangeAnalyticsResponse.DailyMetrics.builder()
                .date(current)
                .tasksCreated((int) dailyCreated)
                .tasksCompleted((int) dailyCompleted)
                .hoursTracked(BigDecimal.ZERO)
                .dayOfWeek(current.getDayOfWeek().toString())
                .build());

            current = current.plusDays(1);
        }

        return DateRangeAnalyticsResponse.builder()
            .startDate(startDate)
            .endDate(endDate)
            .daysInRange((int) daysInRange)
            .totalTasksCreated((int) tasksCreated)
            .totalTasksCompleted((int) tasksCompleted)
            .totalHoursTracked(hoursTracked)
            .averageTasksPerDay(averageTasksPerDay)
            .dailyData(dailyData)
            .build();
    }

    private String getMostProductiveCategory(Long userId) {
        return "General";
    }
}
