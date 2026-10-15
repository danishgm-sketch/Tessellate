import type { EntityListProps } from './index.js';

/** Sample content for previews and tests (not real data). */
export const entityListFixtures: EntityListProps = {
  "entity": "Patient",
  "columns": [
    "name",
    "last visit",
    "status"
  ],
  "rows": [
    {
      "name": "Amira Khan",
      "last visit": "12 Jan",
      "status": "Active"
    },
    {
      "name": "Ben Carter",
      "last visit": "9 Jan",
      "status": "Discharged"
    }
  ],
  "sampleData": true
};
