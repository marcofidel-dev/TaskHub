package com.taskhub.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryCreateRequest {

    @NotBlank(message = "Category name cannot be blank")
    @Size(min = 1, max = 100, message = "Category name must be 1-100 characters")
    private String name;

    @Size(max = 500, message = "Description max 500 characters")
    private String description;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$|^$", message = "Color must be hex format #RRGGBB or empty")
    private String color;
}
