package com.taskhub.service;

import com.taskhub.dto.TaskUpdateRequest;
import com.taskhub.entity.Task;
import com.taskhub.repository.*;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** updateTask must apply the same HTML sanitization as createTask. */
class TaskUpdateSanitizationTest {

    @Test
    void updateTask_stripsHtmlFromTitleAndDescription() {
        TaskRepository tasks = mock(TaskRepository.class);
        Task existing = new Task();
        when(tasks.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(existing));
        when(tasks.save(any())).thenAnswer(i -> i.getArgument(0));

        TaskService service = new TaskService(tasks, mock(UserRepository.class),
                mock(CategoryRepository.class), mock(TagRepository.class));

        TaskUpdateRequest req = new TaskUpdateRequest();
        req.setTitle("<script>alert(1)</script>Hello");
        req.setDescription("<img src=x onerror=alert(1)>desc");

        Task result = service.updateTask(5L, 1L, req);

        assertFalse(result.getTitle().contains("<"));
        assertEquals("alert(1)Hello", result.getTitle());
        assertEquals("desc", result.getDescription());
    }
}
