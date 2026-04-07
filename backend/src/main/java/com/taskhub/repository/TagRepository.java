package com.taskhub.repository;

import com.taskhub.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findByUserId(Long userId);

    Optional<Tag> findByIdAndUserId(Long id, Long userId);

    List<Tag> findByNameAndUserId(String name, Long userId);

    boolean existsByNameAndUserId(String name, Long userId);

    List<Tag> findByIdInAndUserId(List<Long> ids, Long userId);
}
