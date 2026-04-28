package com.taskhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_time_entry", indexes = {
    @Index(name = "idx_task_time_entries", columnList = "task_id"),
    @Index(name = "idx_user_time_entries", columnList = "user_id"),
    @Index(name = "idx_entry_date", columnList = "entry_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskTimeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private BigDecimal hours;

    @Column
    private Integer minutes;

    @Column(length = 500)
    private String description;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (minutes == null) minutes = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public BigDecimal getTotalTimeInHours() {
        if (minutes == null || minutes == 0) {
            return hours;
        }
        BigDecimal minutesInHours = new BigDecimal(minutes)
            .divide(new BigDecimal(60), 2, java.math.RoundingMode.HALF_UP);
        return hours.add(minutesInHours);
    }
}
