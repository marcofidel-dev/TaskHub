package com.taskhub.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    @Override
    public LocalDateTime deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
            throws IOException {
        String date = jsonParser.getText();

        // Si viene con T (formato ISO)
        if (date.contains("T")) {
            return LocalDateTime.parse(date, DateTimeFormatter.ISO_DATE_TIME);
        }

        // Si viene solo fecha (YYYY-MM-DD), asume medianoche
        return LocalDateTime.parse(date + "T00:00:00", DateTimeFormatter.ISO_DATE_TIME);
    }
}
