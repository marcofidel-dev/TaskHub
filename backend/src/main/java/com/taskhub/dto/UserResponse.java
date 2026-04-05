package com.taskhub.dto;

import com.taskhub.entity.User.SubscriptionTier;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String username;
    private SubscriptionTier subscriptionTier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
