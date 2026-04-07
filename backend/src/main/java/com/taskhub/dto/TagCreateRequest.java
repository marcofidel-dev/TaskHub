package com.taskhub.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagCreateRequest {

    @NotBlank(message = "Tag name cannot be blank")
    @Size(min = 1, max = 50, message = "Tag name must be 1-50 characters")
    private String name;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$|^$", message = "Color must be hex format #RRGGBB or empty")
    private String color;
}
