package com.taskhub.dto;

import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WompiWebhookPayload {

    private String event;

    @SerializedName("data")
    private WompiTransactionData data;

    private Long timestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WompiTransactionData {

        private String id;

        @SerializedName("reference")
        private String reference;

        @SerializedName("status")
        private String status; // APPROVED, DECLINED, PENDING

        @SerializedName("amount_in_cents")
        private Long amountInCents;

        @SerializedName("currency")
        private String currency;

        @SerializedName("customer_email")
        private String customerEmail;

        @SerializedName("created_at")
        private String createdAt;
    }
}
