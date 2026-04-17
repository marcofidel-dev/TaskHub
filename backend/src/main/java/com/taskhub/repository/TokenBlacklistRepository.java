package com.taskhub.repository;

import com.taskhub.entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {

    Optional<TokenBlacklist> findByToken(String token);

    @Transactional
    @Modifying
    @Query("DELETE FROM TokenBlacklist t WHERE t.expiresAt < :dateTime")
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
