package com.taskhub.service;

import com.taskhub.dto.CategoryCreateRequest;
import com.taskhub.dto.CategoryResponse;
import com.taskhub.entity.Category;
import com.taskhub.repository.CategoryRepository;
import com.taskhub.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public Category createCategory(Long userId, CategoryCreateRequest req) {
        if (categoryRepository.existsByNameAndUserId(req.getName(), userId)) {
            throw new IllegalArgumentException("Category already exists for this user");
        }

        Category category = Category.builder()
                .name(req.getName())
                .description(req.getDescription())
                .color(req.getColor())
                .userId(userId)
                .build();

        return categoryRepository.save(category);
    }

    public List<Category> getUserCategories(Long userId) {
        return categoryRepository.findByUserId(userId);
    }

    public Optional<Category> getCategoryById(Long categoryId, Long userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId);
    }

    @Transactional
    public Category updateCategory(Long categoryId, Long userId, CategoryCreateRequest req) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        category.setName(req.getName());
        category.setDescription(req.getDescription());
        category.setColor(req.getColor());

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        categoryRepository.delete(category);
    }

    public CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .color(category.getColor())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
