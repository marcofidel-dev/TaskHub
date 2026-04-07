package com.taskhub.controller;

import com.taskhub.dto.TagCreateRequest;
import com.taskhub.dto.TagResponse;
import com.taskhub.dto.ErrorResponse;
import com.taskhub.entity.Tag;
import com.taskhub.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
@Slf4j
public class TagController {

    private final TagService tagService;

    @PostMapping
    public ResponseEntity<?> createTag(
            @RequestParam Long userId,
            @Valid @RequestBody TagCreateRequest req
    ) {
        try {
            Tag tag = tagService.createTag(userId, req);
            return ResponseEntity.status(201).body(tagService.mapToResponse(tag));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new ErrorResponse("VALIDATION_ERROR", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserTags(@RequestParam Long userId) {
        List<TagResponse> tags = tagService.getUserTags(userId)
                .stream()
                .map(tagService::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tags);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTag(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        try {
            tagService.deleteTag(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new ErrorResponse("VALIDATION_ERROR", e.getMessage()));
        }
    }
}
