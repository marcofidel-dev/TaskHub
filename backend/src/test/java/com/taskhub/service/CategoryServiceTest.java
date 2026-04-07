package com.taskhub.service;

import com.taskhub.dto.CategoryCreateRequest;
import com.taskhub.dto.CategoryResponse;
import com.taskhub.entity.Category;
import com.taskhub.repository.CategoryRepository;
import com.taskhub.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private CategoryService categoryService;

    private static final Long USER_ID = 1L;
    private static final Long CAT_ID = 10L;

    private Category buildCategory(Long id, String name, Long userId) {
        return Category.builder()
                .id(id)
                .name(name)
                .description("Desc")
                .color("#FFFFFF")
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private CategoryCreateRequest buildRequest(String name) {
        CategoryCreateRequest req = new CategoryCreateRequest();
        req.setName(name);
        req.setDescription("Description");
        req.setColor("#AABBCC");
        return req;
    }

    // ── createCategory ────────────────────────────────────────────────────────

    @Test
    void testCreateCategory_Success() {
        when(categoryRepository.existsByNameAndUserId("Work", USER_ID)).thenReturn(false);

        Category saved = buildCategory(CAT_ID, "Work", USER_ID);
        when(categoryRepository.save(any(Category.class))).thenReturn(saved);

        Category result = categoryService.createCategory(USER_ID, buildRequest("Work"));

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Work");
        assertThat(result.getUserId()).isEqualTo(USER_ID);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void testCreateCategory_Duplicate() {
        when(categoryRepository.existsByNameAndUserId("Work", USER_ID)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(USER_ID, buildRequest("Work")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");

        verify(categoryRepository, never()).save(any());
    }

    // ── getUserCategories ──────────────────────────────────────────────────────

    @Test
    void testGetUserCategories() {
        Category cat1 = buildCategory(1L, "Work", USER_ID);
        Category cat2 = buildCategory(2L, "Personal", USER_ID);
        when(categoryRepository.findByUserId(USER_ID)).thenReturn(List.of(cat1, cat2));

        List<Category> result = categoryService.getUserCategories(USER_ID);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Category::getName)
                .containsExactlyInAnyOrder("Work", "Personal");
    }

    // ── updateCategory ────────────────────────────────────────────────────────

    @Test
    void testUpdateCategory() {
        Category existing = buildCategory(CAT_ID, "OldName", USER_ID);
        when(categoryRepository.findByIdAndUserId(CAT_ID, USER_ID)).thenReturn(Optional.of(existing));

        Category updated = buildCategory(CAT_ID, "NewName", USER_ID);
        updated.setDescription("New Desc");
        when(categoryRepository.save(any(Category.class))).thenReturn(updated);

        CategoryCreateRequest req = new CategoryCreateRequest();
        req.setName("NewName");
        req.setDescription("New Desc");
        req.setColor("#112233");

        Category result = categoryService.updateCategory(CAT_ID, USER_ID, req);

        assertThat(result.getName()).isEqualTo("NewName");
        verify(categoryRepository).save(existing);
    }

    // ── deleteCategory ────────────────────────────────────────────────────────

    @Test
    void testDeleteCategory() {
        Category cat = buildCategory(CAT_ID, "ToDelete", USER_ID);
        when(categoryRepository.findByIdAndUserId(CAT_ID, USER_ID)).thenReturn(Optional.of(cat));
        doNothing().when(categoryRepository).delete(cat);

        categoryService.deleteCategory(CAT_ID, USER_ID);

        verify(categoryRepository).delete(cat);
    }

    // ── mapToResponse ──────────────────────────────────────────────────────────

    @Test
    void testMapToResponse() {
        Category cat = buildCategory(CAT_ID, "Work", USER_ID);

        CategoryResponse response = categoryService.mapToResponse(cat);

        assertThat(response.getId()).isEqualTo(CAT_ID);
        assertThat(response.getName()).isEqualTo("Work");
        assertThat(response.getColor()).isEqualTo("#FFFFFF");
    }
}
