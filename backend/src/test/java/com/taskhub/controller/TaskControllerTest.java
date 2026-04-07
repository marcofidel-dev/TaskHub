package com.taskhub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskhub.dto.TaskCreateRequest;
import com.taskhub.dto.TaskFilterRequest;
import com.taskhub.entity.Category;
import com.taskhub.entity.Task;
import com.taskhub.entity.User;
import com.taskhub.repository.CategoryRepository;
import com.taskhub.repository.TagRepository;
import com.taskhub.repository.TaskRepository;
import com.taskhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        categoryRepository.deleteAll();
        tagRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .email("test@taskhub.com")
                .username("testuser")
                .password("$2a$10$hashedpassword")
                .subscriptionTier(User.SubscriptionTier.FREE)
                .build());
    }

    // ── POST /api/v1/tasks/create ─────────────────────────────────────────────

    @Test
    void testCreateTask_Returns201() throws Exception {
        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("Integration Test Task");
        req.setDescription("Testing via MockMvc");
        req.setPriority("HIGH");

        mockMvc.perform(post("/api/v1/tasks/create")
                        .param("userId", testUser.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration Test Task"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.userId").value(testUser.getId()))
                .andExpect(jsonPath("$.completed").value(false));
    }

    @Test
    void testInvalidInput_Returns400() throws Exception {
        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle(""); // blank title — fails @NotBlank

        mockMvc.perform(post("/api/v1/tasks/create")
                        .param("userId", testUser.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/v1/tasks ─────────────────────────────────────────────────────

    @Test
    void testGetTasks_Returns200() throws Exception {
        taskRepository.save(Task.builder()
                .title("Task A").userId(testUser.getId())
                .priority(Task.Priority.LOW).build());
        taskRepository.save(Task.builder()
                .title("Task B").userId(testUser.getId())
                .priority(Task.Priority.HIGH).build());

        mockMvc.perform(get("/api/v1/tasks")
                        .param("userId", testUser.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].title", containsInAnyOrder("Task A", "Task B")));
    }

    // ── GET /api/v1/tasks/filter ──────────────────────────────────────────────

    @Test
    void testFilterTasks_WithCategoryId() throws Exception {
        Category catA = categoryRepository.save(Category.builder()
                .name("Work").userId(testUser.getId()).color("#FF0000").build());
        Category catB = categoryRepository.save(Category.builder()
                .name("Personal").userId(testUser.getId()).color("#00FF00").build());

        taskRepository.save(Task.builder()
                .title("Work Task 1").userId(testUser.getId())
                .categoryId(catA.getId()).priority(Task.Priority.MEDIUM).build());
        taskRepository.save(Task.builder()
                .title("Work Task 2").userId(testUser.getId())
                .categoryId(catA.getId()).priority(Task.Priority.HIGH).build());
        taskRepository.save(Task.builder()
                .title("Personal Task").userId(testUser.getId())
                .categoryId(catB.getId()).priority(Task.Priority.LOW).build());

        TaskFilterRequest filter = TaskFilterRequest.builder()
                .categoryId(catA.getId())
                .sortBy("createdAt")
                .sortOrder("DESC")
                .build();

        mockMvc.perform(get("/api/v1/tasks/filter")
                        .param("userId", testUser.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(filter)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].title", everyItem(containsString("Work"))));
    }

    @Test
    void testFilterTasks_WithMultipleParams() throws Exception {
        taskRepository.save(Task.builder()
                .title("High Pending").userId(testUser.getId())
                .priority(Task.Priority.HIGH).isCompleted(false).build());
        taskRepository.save(Task.builder()
                .title("High Done").userId(testUser.getId())
                .priority(Task.Priority.HIGH).isCompleted(true).build());
        taskRepository.save(Task.builder()
                .title("Low Pending").userId(testUser.getId())
                .priority(Task.Priority.LOW).isCompleted(false).build());

        TaskFilterRequest filter = TaskFilterRequest.builder()
                .priority("HIGH")
                .isCompleted(false)
                .sortBy("title")
                .sortOrder("ASC")
                .build();

        mockMvc.perform(get("/api/v1/tasks/filter")
                        .param("userId", testUser.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(filter)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("High Pending"))
                .andExpect(jsonPath("$[0].priority").value("HIGH"))
                .andExpect(jsonPath("$[0].completed").value(false));
    }
}
