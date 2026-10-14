import type { BriefInterpretation } from '../interpretation.js';

/** Real output of the host-daemon brief model v2.0.0 for the physiotherapy acceptance brief (Phase 28). */
export const physioInterpretationFixture: BriefInterpretation = {
  "kind": "interpretation",
  "productModel": {
    "schemaVersion": "1.0.0",
    "productArchetypes": [
      {
        "tag": "healthcare-clinic",
        "weight": 100
      }
    ],
    "primaryAudience": "Patients, Clinicians",
    "userSophistication": 40,
    "primaryObjective": "Book care easily and run the clinic smoothly",
    "secondaryObjectives": [],
    "jobsToBeDone": [
      "Book appointment",
      "Pay deposit",
      "Manage treatment notes",
      "Manage invoices"
    ],
    "entities": [
      {
        "name": "Patient",
        "description": "A person receiving care.",
        "fields": [
          "name",
          "date of birth",
          "contact details",
          "medical history",
          "consent"
        ]
      },
      {
        "name": "Appointment",
        "description": "A scheduled meeting for a service.",
        "fields": [
          "date and time",
          "service",
          "with",
          "status",
          "notes",
          "deposit"
        ]
      },
      {
        "name": "Deposit",
        "description": "An upfront payment to secure something.",
        "fields": [
          "amount",
          "booking",
          "status",
          "refundable"
        ]
      },
      {
        "name": "Clinician",
        "description": "A professional who provides care.",
        "fields": [
          "name",
          "specialism",
          "availability",
          "location"
        ]
      },
      {
        "name": "Treatment note",
        "description": "A clinician's record of a session.",
        "fields": [
          "patient",
          "date",
          "assessment",
          "plan",
          "clinician"
        ]
      },
      {
        "name": "Invoice",
        "description": "A request for payment.",
        "fields": [
          "number",
          "client",
          "amount",
          "due date",
          "status"
        ]
      }
    ],
    "workflows": [
      {
        "id": "book-appointment",
        "name": "Book appointment",
        "steps": [
          "Choose a service",
          "Pick a time",
          "Enter details",
          "Confirm"
        ]
      },
      {
        "id": "pay-deposit",
        "name": "Pay deposit",
        "steps": [
          "Review amount",
          "Enter payment details",
          "Confirm payment",
          "Receive receipt"
        ]
      },
      {
        "id": "manage-treatment-note",
        "name": "Manage treatment notes",
        "steps": [
          "Open list",
          "Filter and find",
          "Edit details",
          "Save"
        ]
      },
      {
        "id": "manage-invoice",
        "name": "Manage invoices",
        "steps": [
          "Open list",
          "Filter and find",
          "Edit details",
          "Save"
        ]
      }
    ],
    "trustRequirement": 100,
    "informationComplexity": 60,
    "dataDensity": 55,
    "collaborationLevel": 50,
    "transactionCriticality": 60,
    "navigationComplexity": 55,
    "mobileImportance": 75,
    "likelyScreens": [
      {
        "name": "Home",
        "screenType": "marketing",
        "purpose": "Explain the product and convert visitors."
      },
      {
        "name": "Book an appointment",
        "screenType": "booking-flow",
        "purpose": "Choose a time, give details and confirm an appointment."
      },
      {
        "name": "Checkout",
        "screenType": "checkout-transaction",
        "purpose": "Review and pay securely."
      },
      {
        "name": "Overview",
        "screenType": "dashboard",
        "purpose": "Today at a glance for healthcare clinic."
      },
      {
        "name": "Patients",
        "screenType": "index-list",
        "purpose": "Browse, search and filter patients."
      },
      {
        "name": "Patient details",
        "screenType": "detail-entity",
        "purpose": "See and manage a single patient."
      },
      {
        "name": "Patient history",
        "screenType": "detail-entity",
        "purpose": "See the timeline of a patient."
      },
      {
        "name": "Calendar",
        "screenType": "calendar-schedule",
        "purpose": "See and manage appointments by day, week and month."
      },
      {
        "name": "Appointments",
        "screenType": "index-list",
        "purpose": "Browse, search and filter appointments."
      },
      {
        "name": "Appointment details",
        "screenType": "detail-entity",
        "purpose": "See and manage a single appointment."
      },
      {
        "name": "Deposits",
        "screenType": "index-list",
        "purpose": "Browse, search and filter deposits."
      },
      {
        "name": "Clinicians",
        "screenType": "index-list",
        "purpose": "Browse, search and filter clinicians."
      },
      {
        "name": "Clinician details",
        "screenType": "detail-entity",
        "purpose": "See and manage a single clinician."
      },
      {
        "name": "Treatment note editor",
        "screenType": "workspace-editor",
        "purpose": "Create and edit treatment notes."
      },
      {
        "name": "Treatment note history",
        "screenType": "detail-entity",
        "purpose": "See the timeline of a treatment note."
      },
      {
        "name": "Treatment notes",
        "screenType": "index-list",
        "purpose": "Browse, search and filter treatment notes."
      },
      {
        "name": "Treatment note details",
        "screenType": "detail-entity",
        "purpose": "See and manage a single treatment note."
      },
      {
        "name": "Invoices",
        "screenType": "index-list",
        "purpose": "Browse, search and filter invoices."
      },
      {
        "name": "Invoice details",
        "screenType": "detail-entity",
        "purpose": "See and manage a single invoice."
      },
      {
        "name": "New invoice",
        "screenType": "form-flow",
        "purpose": "Create an invoice with validated fields."
      },
      {
        "name": "Settings",
        "screenType": "settings",
        "purpose": "Profile, notifications and preferences."
      },
      {
        "name": "Sign in",
        "screenType": "authentication",
        "purpose": "Let people sign in or create an account."
      }
    ],
    "requiredCapabilities": [
      "auth",
      "payments",
      "privacy-health"
    ],
    "forbiddenPatterns": [],
    "constraints": {
      "accessibilityFloor": "AAA",
      "targetDevices": [
        "desktop",
        "tablet",
        "mobile"
      ]
    }
  },
  "screenGraph": {
    "id": "graph-healthcare-clinic",
    "groups": [
      {
        "id": "group-marketing",
        "name": "Marketing",
        "screens": [
          {
            "id": "screen-marketing-home",
            "name": "Home",
            "slug": "/",
            "screenType": "marketing",
            "purpose": "Explain the product and convert visitors.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 60,
            "expectedData": [],
            "requiredRoles": [],
            "optionalRoles": []
          }
        ]
      },
      {
        "id": "group-public",
        "name": "Customer journeys",
        "screens": [
          {
            "id": "screen-appointment-booking",
            "name": "Book an appointment",
            "slug": "/appointments/booking",
            "screenType": "booking-flow",
            "purpose": "Choose a time, give details and confirm an appointment.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 85,
            "expectedData": [
              "date and time",
              "service",
              "with",
              "status",
              "notes"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Appointment"
          },
          {
            "id": "screen-checkout",
            "name": "Checkout",
            "slug": "/checkout",
            "screenType": "checkout-transaction",
            "purpose": "Review and pay securely.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 85,
            "expectedData": [
              "amount",
              "booking",
              "status",
              "refundable"
            ],
            "requiredRoles": [],
            "optionalRoles": []
          }
        ]
      },
      {
        "id": "group-app",
        "name": "Application",
        "screens": [
          {
            "id": "screen-overview",
            "name": "Overview",
            "slug": "/overview",
            "screenType": "dashboard",
            "purpose": "Today at a glance for healthcare clinic.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 80,
            "expectedData": [],
            "requiredRoles": [],
            "optionalRoles": []
          },
          {
            "id": "screen-patient-collection",
            "name": "Patients",
            "slug": "/patients",
            "screenType": "index-list",
            "purpose": "Browse, search and filter patients.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 70,
            "expectedData": [
              "name",
              "date of birth",
              "contact details",
              "medical history",
              "consent"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Patient"
          },
          {
            "id": "screen-patient-detail",
            "name": "Patient details",
            "slug": "/patients/detail",
            "screenType": "detail-entity",
            "purpose": "See and manage a single patient.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "name",
              "date of birth",
              "contact details",
              "medical history",
              "consent"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Patient"
          },
          {
            "id": "screen-patient-timeline",
            "name": "Patient history",
            "slug": "/patients/timeline",
            "screenType": "detail-entity",
            "purpose": "See the timeline of a patient.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "name",
              "date of birth",
              "contact details",
              "medical history",
              "consent"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Patient"
          },
          {
            "id": "screen-calendar",
            "name": "Calendar",
            "slug": "/calendar",
            "screenType": "calendar-schedule",
            "purpose": "See and manage appointments by day, week and month.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 85,
            "expectedData": [
              "date and time",
              "service",
              "with",
              "status",
              "notes"
            ],
            "requiredRoles": [],
            "optionalRoles": []
          },
          {
            "id": "screen-appointment-collection",
            "name": "Appointments",
            "slug": "/appointments",
            "screenType": "index-list",
            "purpose": "Browse, search and filter appointments.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 70,
            "expectedData": [
              "date and time",
              "service",
              "with",
              "status",
              "notes"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Appointment"
          },
          {
            "id": "screen-appointment-detail",
            "name": "Appointment details",
            "slug": "/appointments/detail",
            "screenType": "detail-entity",
            "purpose": "See and manage a single appointment.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "date and time",
              "service",
              "with",
              "status",
              "notes"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Appointment"
          },
          {
            "id": "screen-deposit-collection",
            "name": "Deposits",
            "slug": "/deposits",
            "screenType": "index-list",
            "purpose": "Browse, search and filter deposits.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 70,
            "expectedData": [
              "amount",
              "booking",
              "status",
              "refundable"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Deposit"
          },
          {
            "id": "screen-clinician-collection",
            "name": "Clinicians",
            "slug": "/clinicians",
            "screenType": "index-list",
            "purpose": "Browse, search and filter clinicians.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 70,
            "expectedData": [
              "name",
              "specialism",
              "availability",
              "location"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Clinician"
          },
          {
            "id": "screen-clinician-detail",
            "name": "Clinician details",
            "slug": "/clinicians/detail",
            "screenType": "detail-entity",
            "purpose": "See and manage a single clinician.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "name",
              "specialism",
              "availability",
              "location"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Clinician"
          },
          {
            "id": "screen-treatment-note-editor",
            "name": "Treatment note editor",
            "slug": "/treatment-notes/editor",
            "screenType": "workspace-editor",
            "purpose": "Create and edit treatment notes.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "patient",
              "date",
              "assessment",
              "plan",
              "clinician"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Treatment note"
          },
          {
            "id": "screen-treatment-note-timeline",
            "name": "Treatment note history",
            "slug": "/treatment-notes/timeline",
            "screenType": "detail-entity",
            "purpose": "See the timeline of a treatment note.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "patient",
              "date",
              "assessment",
              "plan",
              "clinician"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Treatment note"
          },
          {
            "id": "screen-treatment-note-collection",
            "name": "Treatment notes",
            "slug": "/treatment-notes",
            "screenType": "index-list",
            "purpose": "Browse, search and filter treatment notes.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "patient",
              "date",
              "assessment",
              "plan",
              "clinician"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Treatment note"
          },
          {
            "id": "screen-treatment-note-detail",
            "name": "Treatment note details",
            "slug": "/treatment-notes/detail",
            "screenType": "detail-entity",
            "purpose": "See and manage a single treatment note.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "patient",
              "date",
              "assessment",
              "plan",
              "clinician"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Treatment note"
          },
          {
            "id": "screen-invoice-collection",
            "name": "Invoices",
            "slug": "/invoices",
            "screenType": "index-list",
            "purpose": "Browse, search and filter invoices.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "number",
              "client",
              "amount",
              "due date",
              "status"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Invoice"
          },
          {
            "id": "screen-invoice-detail",
            "name": "Invoice details",
            "slug": "/invoices/detail",
            "screenType": "detail-entity",
            "purpose": "See and manage a single invoice.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "number",
              "client",
              "amount",
              "due date",
              "status"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Invoice"
          },
          {
            "id": "screen-invoice-create",
            "name": "New invoice",
            "slug": "/invoices/create",
            "screenType": "form-flow",
            "purpose": "Create an invoice with validated fields.",
            "jobs": [],
            "required": false,
            "navigationVisibility": "secondary",
            "importance": 50,
            "expectedData": [
              "number",
              "client",
              "amount",
              "due date",
              "status"
            ],
            "requiredRoles": [],
            "optionalRoles": [],
            "entity": "Invoice"
          }
        ]
      },
      {
        "id": "group-settings",
        "name": "Settings & account",
        "screens": [
          {
            "id": "screen-settings",
            "name": "Settings",
            "slug": "/settings",
            "screenType": "settings",
            "purpose": "Profile, notifications and preferences.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 60,
            "expectedData": [],
            "requiredRoles": [],
            "optionalRoles": []
          }
        ]
      },
      {
        "id": "group-authentication",
        "name": "Authentication",
        "screens": [
          {
            "id": "screen-sign-in",
            "name": "Sign in",
            "slug": "/sign-in",
            "screenType": "authentication",
            "purpose": "Let people sign in or create an account.",
            "jobs": [],
            "required": true,
            "navigationVisibility": "primary",
            "importance": 60,
            "expectedData": [],
            "requiredRoles": [],
            "optionalRoles": []
          }
        ]
      }
    ],
    "edges": [
      {
        "id": "edge-patient",
        "fromScreenId": "screen-patient-collection",
        "toScreenId": "screen-patient-detail",
        "label": "Open"
      },
      {
        "id": "edge-appointment",
        "fromScreenId": "screen-appointment-collection",
        "toScreenId": "screen-appointment-detail",
        "label": "Open"
      },
      {
        "id": "edge-clinician",
        "fromScreenId": "screen-clinician-collection",
        "toScreenId": "screen-clinician-detail",
        "label": "Open"
      },
      {
        "id": "edge-treatment-note",
        "fromScreenId": "screen-treatment-note-collection",
        "toScreenId": "screen-treatment-note-detail",
        "label": "Open"
      },
      {
        "id": "edge-invoice",
        "fromScreenId": "screen-invoice-collection",
        "toScreenId": "screen-invoice-detail",
        "label": "Open"
      }
    ]
  },
  "feel": "calm, trustworthy, accessible",
  "assumptions": [
    "Applied \u201colder users\u201d: accessibilityFloor AAA, mobile -5.",
    "Applied \u201caccessible\u201d: accessibilityFloor AAA.",
    "Applied \u201ctrustworthy\u201d: trust 10."
  ],
  "confidence": {
    "archetype": 1.0,
    "entities": {
      "Patient": 0.9,
      "Appointment": 0.55,
      "Deposit": 0.55,
      "Clinician": 0.52,
      "Treatment note": 0.55,
      "Invoice": 0.55
    },
    "overall": 0.8
  },
  "alternatives": [
    {
      "tag": "healthcare-clinic",
      "probability": 1.0
    },
    {
      "tag": "automotive",
      "probability": 0.0
    },
    {
      "tag": "booking-scheduling",
      "probability": 0.0
    },
    {
      "tag": "local-business",
      "probability": 0.0
    },
    {
      "tag": "beauty-salon",
      "probability": 0.0
    }
  ],
  "modelVersion": "v2.0.0"
};
