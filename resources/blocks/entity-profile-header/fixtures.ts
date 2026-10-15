import type { EntityProfileHeaderProps } from './index.js';

/** Sample content for previews and tests (not real data). */
export const entityProfileHeaderFixtures: EntityProfileHeaderProps = {
  "entity": "Patient",
  "fields": [
    "name",
    "status",
    "date of birth",
    "clinician"
  ],
  "record": {
    "name": "Amira Khan",
    "status": "Active",
    "date of birth": "1958-04-02",
    "clinician": "Dr Osei"
  },
  "sampleData": true,
  "actionLabel": "Book appointment"
};
