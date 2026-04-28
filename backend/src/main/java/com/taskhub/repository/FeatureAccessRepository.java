package com.taskhub.repository;

import com.taskhub.entity.FeatureAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeatureAccessRepository extends JpaRepository<FeatureAccess, Long> {

    Optional<FeatureAccess> findByUserIdAndFeatureName(Long userId, String featureName);

    List<FeatureAccess> findByUserId(Long userId);

    void deleteAllByUserId(Long userId);
}
