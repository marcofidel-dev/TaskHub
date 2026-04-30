package com.taskhub.config;

import com.google.gson.Gson;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "wompi")
@Data
public class WompiConfig {

    private String publicKey;
    private String privateKey;
    private String apiUrl;
    private String webhookSecret;
    private Boolean sandbox;

    public String getAuthHeader() {
        return "Bearer " + privateKey;
    }

    @Bean
    public Gson gson() {
        return new Gson();
    }
}
