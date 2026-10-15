import type { AdvancedDataTableProps } from './index.js';

/** Sample content for previews and tests (not real data). */
export const advancedDataTableFixtures: AdvancedDataTableProps = {
  "entity": "Appointment",
  "columns": [
    "patient",
    "date and time",
    "service",
    "status"
  ],
  "rows": [
    {
      "patient": "Amira Khan",
      "date and time": "2026-01-12 09:00",
      "service": "Assessment",
      "status": "Scheduled"
    },
    {
      "patient": "Ben Carter",
      "date and time": "2026-01-13 10:30",
      "service": "Follow-up",
      "status": "Completed"
    }
  ],
  "sampleData": true
};
