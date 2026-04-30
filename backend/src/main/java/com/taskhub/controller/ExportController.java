package com.taskhub.controller;

import com.taskhub.dto.ExportTasksRequest;
import com.taskhub.security.CurrentUser;
import com.taskhub.service.ExportService;
import com.taskhub.service.FeatureAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;
    private final FeatureAccessService featureAccessService;

    private static final DateTimeFormatter FILENAME_FMT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @PostMapping("/tasks-csv")
    public ResponseEntity<?> exportTasksAsCSV(
            @CurrentUser Long userId,
            @RequestBody(required = false) ExportTasksRequest request) {

        if (!featureAccessService.canUseFeature(userId, "csv_export")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            if (request == null) request = ExportTasksRequest.builder().build();
            byte[] data = exportService.exportTasksAsCSV(userId, request);
            String filename = "tasks_" + LocalDateTime.now().format(FILENAME_FMT) + ".csv";

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.valueOf("text/csv"))
                .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error exporting tasks: " + e.getMessage());
        }
    }

    @PostMapping("/tasks-excel")
    public ResponseEntity<?> exportTasksAsExcel(
            @CurrentUser Long userId,
            @RequestBody(required = false) ExportTasksRequest request) {

        if (!featureAccessService.canUseFeature(userId, "csv_export")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            if (request == null) request = ExportTasksRequest.builder().build();
            byte[] data = exportService.exportTasksAsExcel(userId, request);
            String filename = "tasks_" + LocalDateTime.now().format(FILENAME_FMT) + ".xlsx";

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error exporting tasks: " + e.getMessage());
        }
    }

    @PostMapping("/tasks-calendar")
    public ResponseEntity<?> exportTasksAsCalendar(
            @CurrentUser Long userId,
            @RequestBody(required = false) ExportTasksRequest request) {

        if (!featureAccessService.canUseFeature(userId, "csv_export")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            if (request == null) request = ExportTasksRequest.builder().build();
            byte[] data = exportService.exportTasksAsICS(userId, request);
            String filename = "tasks_" + LocalDateTime.now().format(FILENAME_FMT) + ".ics";

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.valueOf("text/calendar"))
                .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error exporting calendar: " + e.getMessage());
        }
    }
}
