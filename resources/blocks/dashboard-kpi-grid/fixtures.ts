import type { DashboardKpiGridProps } from './index.js';

/** Sample content for previews and tests (not real data). */
export const dashboardKpiGridFixtures: DashboardKpiGridProps = {
  "metrics": [
    {
      "label": "Appointments this week",
      "value": 86,
      "change": "+9%",
      "positive": true,
      "sample": true
    },
    {
      "label": "New patients",
      "value": 14,
      "sample": true
    }
  ]
};
