package com.taskhub.service;

import com.taskhub.entity.SubscriptionTransaction;
import com.taskhub.repository.SubscriptionTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionTransactionRepository subscriptionTransactionRepository;

    @Transactional
    public void recordTransaction(Long userId, String plan, BigDecimal amount,
                                  String transactionId, String status) {
        SubscriptionTransaction transaction = SubscriptionTransaction.builder()
                .userId(userId)
                .plan(plan)
                .amount(amount)
                .transactionId(transactionId)
                .status(status)
                .currency("COP")
                .paymentMethod("WOMPI")
                .build();

        subscriptionTransactionRepository.save(transaction);
        log.info("Recorded transaction {} for userId={} plan={} status={}", transactionId, userId, plan, status);
    }

    public List<SubscriptionTransaction> getUserTransactions(Long userId) {
        return subscriptionTransactionRepository.findByUserId(userId);
    }
}
