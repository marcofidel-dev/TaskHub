package com.taskhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportTasksRequest {

    private Boolean includeSubtasks;
    private Boolean includeTimeEntries;
    private Boolean includeCompleted;

    public ExportTasksRequest withDefaults() {
        return ExportTasksRequest.builder()
            .includeSubtasks(this.includeSubtasks != null ? this.includeSubtasks : true)
            .includeTimeEntries(this.includeTimeEntries != null ? this.includeTimeEntries : true)
            .includeCompleted(this.includeCompleted != null ? this.includeCompleted : true)
            .build();
    }
}
