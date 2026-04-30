package com.taskhub.service;

import com.taskhub.dto.ExportTasksRequest;
import com.taskhub.entity.Subtask;
import com.taskhub.entity.Task;
import com.taskhub.repository.SubtaskRepository;
import com.taskhub.repository.TaskRepository;
import com.taskhub.repository.TaskTimeEntryRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExportService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final TaskTimeEntryRepository timeEntryRepository;

    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter ICS_DATETIME_FMT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
    private static final DateTimeFormatter ICS_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private static final String[] CSV_HEADERS = {
        "Task ID", "Title", "Description", "Category ID", "Priority",
        "Completed", "Created At", "Due Date", "Subtasks Count", "Time Entries Count"
    };

    public byte[] exportTasksAsCSV(Long userId, ExportTasksRequest request) throws IOException {
        request = request.withDefaults();
        List<Task> tasks = taskRepository.findByUserId(userId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(baos));
             CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.builder().build())) {

            printer.printRecord((Object[]) CSV_HEADERS);

            for (Task task : tasks) {
                if (Boolean.TRUE.equals(task.getIsCompleted()) && !request.getIncludeCompleted()) {
                    continue;
                }

                int subtaskCount = request.getIncludeSubtasks()
                    ? (int) subtaskRepository.countByTaskId(task.getId()) : 0;
                int timeEntriesCount = request.getIncludeTimeEntries()
                    ? timeEntryRepository.findByTaskId(task.getId()).size() : 0;

                printer.printRecord(
                    task.getId(),
                    task.getTitle(),
                    task.getDescription() != null ? task.getDescription() : "",
                    task.getCategoryId() != null ? task.getCategoryId() : "",
                    task.getPriority() != null ? task.getPriority().name() : "",
                    Boolean.TRUE.equals(task.getIsCompleted()) ? "Yes" : "No",
                    task.getCreatedAt().format(DATETIME_FMT),
                    task.getDueDate() != null ? task.getDueDate().format(DATE_FMT) : "",
                    subtaskCount,
                    timeEntriesCount
                );

                if (request.getIncludeSubtasks()) {
                    for (Subtask subtask : subtaskRepository.findByTaskIdOrderByOrderIndex(task.getId())) {
                        printer.printRecord(
                            "  └─ " + subtask.getId(),
                            "   " + subtask.getTitle(),
                            subtask.getDescription() != null ? subtask.getDescription() : "",
                            "", "", Boolean.TRUE.equals(subtask.getCompleted()) ? "Yes" : "No",
                            subtask.getCreatedAt().format(DATETIME_FMT),
                            "", "", ""
                        );
                    }
                }
            }
        }

        return baos.toByteArray();
    }

    public byte[] exportTasksAsExcel(Long userId, ExportTasksRequest request) throws IOException {
        request = request.withDefaults();
        List<Task> tasks = taskRepository.findByUserId(userId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Tasks");

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < CSV_HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(CSV_HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Task task : tasks) {
                if (Boolean.TRUE.equals(task.getIsCompleted()) && !request.getIncludeCompleted()) {
                    continue;
                }

                int subtaskCount = request.getIncludeSubtasks()
                    ? (int) subtaskRepository.countByTaskId(task.getId()) : 0;
                int timeEntriesCount = request.getIncludeTimeEntries()
                    ? timeEntryRepository.findByTaskId(task.getId()).size() : 0;

                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(task.getId());
                row.createCell(1).setCellValue(task.getTitle());
                row.createCell(2).setCellValue(task.getDescription() != null ? task.getDescription() : "");
                row.createCell(3).setCellValue(task.getCategoryId() != null ? task.getCategoryId() : 0L);
                row.createCell(4).setCellValue(task.getPriority() != null ? task.getPriority().name() : "");
                row.createCell(5).setCellValue(Boolean.TRUE.equals(task.getIsCompleted()) ? "Yes" : "No");
                row.createCell(6).setCellValue(task.getCreatedAt().format(DATETIME_FMT));
                row.createCell(7).setCellValue(task.getDueDate() != null ? task.getDueDate().format(DATE_FMT) : "");
                row.createCell(8).setCellValue(subtaskCount);
                row.createCell(9).setCellValue(timeEntriesCount);
            }

            for (int i = 0; i < CSV_HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    public byte[] exportTasksAsICS(Long userId, ExportTasksRequest request) throws IOException {
        request = request.withDefaults();
        List<Task> tasks = taskRepository.findByUserId(userId);

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//TaskHub//Task Calendar//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:PUBLISH\r\n");
        ics.append("X-WR-CALNAME:TaskHub Tasks\r\n");
        ics.append("X-WR-TIMEZONE:UTC\r\n");

        for (Task task : tasks) {
            if (Boolean.TRUE.equals(task.getIsCompleted()) && !request.getIncludeCompleted()) {
                continue;
            }

            ics.append("BEGIN:VEVENT\r\n");
            ics.append("UID:task-").append(task.getId()).append("@taskhub.local\r\n");
            ics.append("DTSTAMP:").append(task.getCreatedAt().format(ICS_DATETIME_FMT)).append("\r\n");

            if (task.getDueDate() != null) {
                // date-only value per RFC 5545
                ics.append("DTSTART;VALUE=DATE:").append(task.getDueDate().format(ICS_DATE_FMT)).append("\r\n");
                ics.append("DTEND;VALUE=DATE:").append(task.getDueDate().format(ICS_DATE_FMT)).append("\r\n");
            } else {
                ics.append("DTSTART:").append(task.getCreatedAt().format(ICS_DATETIME_FMT)).append("\r\n");
            }

            ics.append("SUMMARY:").append(escapeICS(task.getTitle())).append("\r\n");

            StringBuilder desc = new StringBuilder();
            if (task.getDescription() != null) {
                desc.append(escapeICS(task.getDescription())).append("\\n");
            }
            if (request.getIncludeSubtasks()) {
                List<Subtask> subtasks = subtaskRepository.findByTaskIdOrderByOrderIndex(task.getId());
                if (!subtasks.isEmpty()) {
                    desc.append("\\nSubtasks:\\n");
                    for (Subtask s : subtasks) {
                        desc.append(Boolean.TRUE.equals(s.getCompleted()) ? "☑" : "☐")
                            .append(" ").append(escapeICS(s.getTitle())).append("\\n");
                    }
                }
            }
            if (desc.length() > 0) {
                ics.append("DESCRIPTION:").append(desc).append("\r\n");
            }

            ics.append("STATUS:").append(Boolean.TRUE.equals(task.getIsCompleted()) ? "COMPLETED" : "NEEDS-ACTION").append("\r\n");
            ics.append("PRIORITY:").append(toPriorityInt(task.getPriority())).append("\r\n");
            ics.append("END:VEVENT\r\n");
        }

        ics.append("END:VCALENDAR\r\n");
        return ics.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String escapeICS(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace(",", "\\,")
                    .replace(";", "\\;")
                    .replace("\n", "\\n");
    }

    private int toPriorityInt(Task.Priority priority) {
        if (priority == null) return 0;
        return switch (priority) {
            case HIGH -> 3;
            case MEDIUM -> 5;
            case LOW -> 7;
        };
    }
}
