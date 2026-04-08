package com.taskhub.controller;

import com.taskhub.dto.CategoryCreateRequest;
import com.taskhub.dto.CategoryResponse;
import com.taskhub.dto.ErrorResponse;
import com.taskhub.security.CurrentUser;
import com.taskhub.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<?> createCategory(
            @CurrentUser Long userId,
            @Valid @RequestBody CategoryCreateRequest req
    ) {
        try {
            var category = categoryService.createCategory(userId, req);
            return ResponseEntity.status(201).body(categoryService.mapToResponse(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new ErrorResponse("VALIDATION_ERROR", e.getMessage(), LocalDateTime.now()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserCategories(@CurrentUser Long userId) {
        List<CategoryResponse> categories = categoryService.getUserCategories(userId)
                .stream()
                .map(categoryService::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(
            @PathVariable Long id,
            @CurrentUser Long userId
    ) {
        return categoryService.getCategoryById(id, userId)
                .map(category -> ResponseEntity.ok(categoryService.mapToResponse(category)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @CurrentUser Long userId,
            @Valid @RequestBody CategoryCreateRequest req
    ) {
        try {
            var category = categoryService.updateCategory(id, userId, req);
            return ResponseEntity.ok(categoryService.mapToResponse(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(new ErrorResponse("NOT_FOUND", e.getMessage(), LocalDateTime.now()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @PathVariable Long id,
            @CurrentUser Long userId
    ) {
        try {
            categoryService.deleteCategory(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(new ErrorResponse("NOT_FOUND", e.getMessage(), LocalDateTime.now()));
        }
    }
}
