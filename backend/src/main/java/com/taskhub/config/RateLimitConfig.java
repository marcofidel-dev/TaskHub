package com.taskhub.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Bucket4j rate limit configurations.
 *
 * Each method is a factory that creates a fresh Bucket for a given IP.
 * Limits:
 *   login    → 5 attempts  / 15 minutes
 *   register → 10 attempts  / 1 hour
 *   general  → 100 requests / 1 minute
 */
@Configuration
public class RateLimitConfig {

    /** 5 login attempts per 15 minutes per IP. */
    public Bucket newLoginBucket() {
        Bandwidth limit = Bandwidth.classic(5,
                Refill.intervally(5, Duration.ofMinutes(15)));
        return Bucket.builder().addLimit(limit).build();
    }

    /** 10 register attempts per hour per IP. */
    public Bucket newRegisterBucket() {
        Bandwidth limit = Bandwidth.classic(10,
                Refill.intervally(10, Duration.ofHours(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    /** 100 general requests per minute per IP. */
    public Bucket newGeneralBucket() {
        Bandwidth limit = Bandwidth.classic(100,
                Refill.greedy(100, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
}
