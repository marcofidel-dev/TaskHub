package com.taskhub.repository;

import com.taskhub.entity.SubscriptionTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionTransactionRepository extends JpaRepository<SubscriptionTransaction, Long> {

    List<SubscriptionTransaction> findByUserId(Long userId);

    Optional<SubscriptionTransaction> findByTransactionId(String transactionId);
}
