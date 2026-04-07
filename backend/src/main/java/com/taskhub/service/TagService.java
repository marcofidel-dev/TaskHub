package com.taskhub.service;

import com.taskhub.dto.TagCreateRequest;
import com.taskhub.dto.TagResponse;
import com.taskhub.entity.Tag;
import com.taskhub.repository.TagRepository;
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
public class TagService {

    private final TagRepository tagRepository;

    @Transactional
    public Tag createTag(Long userId, TagCreateRequest req) {
        if (tagRepository.existsByNameAndUserId(req.getName(), userId)) {
            throw new IllegalArgumentException("Tag already exists for this user");
        }

        Tag tag = Tag.builder()
                .name(req.getName())
                .color(req.getColor())
                .userId(userId)
                .build();

        return tagRepository.save(tag);
    }

    public List<Tag> getUserTags(Long userId) {
        return tagRepository.findByUserId(userId);
    }

    public Optional<Tag> getTagById(Long tagId, Long userId) {
        return tagRepository.findByIdAndUserId(tagId, userId);
    }

    @Transactional
    public void deleteTag(Long tagId, Long userId) {
        Tag tag = tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Tag not found"));

        tagRepository.delete(tag);
    }

    public TagResponse mapToResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .color(tag.getColor())
                .createdAt(tag.getCreatedAt())
                .build();
    }
}
