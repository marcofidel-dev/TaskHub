package com.taskhub.controller;

import com.taskhub.dto.UserLimitsResponse;
import com.taskhub.security.CurrentUser;
import com.taskhub.service.PlanLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserLimitsController {

    private final PlanLimitService planLimitService;

    @GetMapping("/limits")
    public ResponseEntity<UserLimitsResponse> getUserLimits(@CurrentUser Long userId) {
        return ResponseEntity.ok(planLimitService.getUserLimits(userId));
    }
}
