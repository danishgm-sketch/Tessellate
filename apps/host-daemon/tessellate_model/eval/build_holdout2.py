"""
Second held-out evaluation set (Phase 28, written after model v2.0.0-rc5 was frozen).

briefs.jsonl was used during development, so its scores are optimistic. This set was written once, after
tuning stopped, and must never be used to tune the model. Report both scores honestly in the model card.
Run this file to regenerate holdout2.jsonl.
"""

import json
import os

# (brief, acceptable archetypes, gold entities, required screen types)
EVAL = [
    ("Osteopathy practice website where patients pick a practitioner, book a 45 minute slot and pay online. Practitioners keep clinical notes.",
     ["healthcare-clinic", "booking-scheduling"], ["Patient", "Practitioner", "Appointment", "Clinical note"], ["booking-flow", "calendar-schedule"]),
    ("Video consultations with GPs: patients describe symptoms, join a call and receive prescriptions.",
     ["telehealth", "healthcare-clinic"], ["Patient", "Doctor", "Consultation", "Prescription"], ["booking-flow", "index-list"]),
    ("Veterinary clinic app. Pet owners register their pets, book vaccinations and see vet records.",
     ["pet-care", "healthcare-clinic", "booking-scheduling"], ["Pet", "Owner", "Vaccination", "Appointment"], ["booking-flow", "index-list"]),
    ("Dog walking service: owners request walks, walkers accept jobs and share a route map afterwards.",
     ["pet-care", "marketplace", "local-business"], ["Owner", "Dog", "Walk", "Walker"], ["map-explore", "index-list"]),
    ("Yoga studio timetable with class passes. Students buy passes and reserve mats in classes.",
     ["fitness-wellness", "booking-scheduling"], ["Student", "Class", "Pass", "Booking"], ["calendar-schedule", "booking-flow", "checkout-transaction"]),
    ("Online store for refurbished laptops with warranties, returns and order tracking.",
     ["ecommerce"], ["Product", "Order", "Warranty", "Return"], ["search-explore", "checkout-transaction", "index-list"]),
    ("Second-hand furniture marketplace. People list items with photos, buyers make offers and arrange collection.",
     ["marketplace"], ["Listing", "Offer", "Buyer", "Seller"], ["search-explore", "messages-collaboration"]),
    ("Our warehouse needs stock counts, purchase orders to suppliers and low-stock alerts.",
     ["inventory-warehouse", "erp-operations"], ["Stock", "Purchase order", "Supplier", "Alert"], ["index-list", "analytics-reporting"]),
    ("Freight forwarding portal: shippers request quotes, book shipments and track containers.",
     ["logistics-shipping"], ["Shipper", "Quote", "Shipment", "Container"], ["index-list", "map-explore"]),
    ("Construction site diary where foremen log daily progress, snag lists and photos, and the project manager approves variations.",
     ["construction", "project-management"], ["Daily log", "Snag", "Photo", "Variation"], ["index-list", "form-flow"]),
    ("Law firm client portal: clients upload documents, sign engagement letters and see matter updates.",
     ["legal", "professional-services"], ["Client", "Document", "Matter", "Engagement letter"], ["index-list", "detail-entity"]),
    ("Accounting practice: accountants request documents from clients and track tax return deadlines.",
     ["accounting", "professional-services"], ["Client", "Document", "Tax return", "Deadline"], ["index-list", "calendar-schedule"]),
    ("Insurance claims app: policyholders file claims with photos and adjusters assess them.",
     ["insurance"], ["Policyholder", "Claim", "Photo", "Adjuster"], ["form-flow", "index-list"]),
    ("Personal budgeting app that categorises bank transactions and sets monthly budgets with goals.",
     ["personal-finance", "fintech"], ["Transaction", "Category", "Budget", "Goal"], ["analytics-reporting", "index-list"]),
    ("Business banking dashboard: view accounts, send payments, manage cards and approve payments over a limit.",
     ["banking", "fintech"], ["Account", "Payment", "Card", "Approval"], ["analytics-reporting", "index-list"]),
    ("Employee onboarding for HR: new starters complete forms, managers assign equipment and track training.",
     ["hr-people", "internal-tools"], ["Employee", "Form", "Equipment", "Training"], ["form-flow", "index-list"]),
    ("Holiday booking for staff: employees request leave, managers approve it and see a team calendar.",
     ["hr-people", "internal-tools"], ["Employee", "Leave request", "Manager"], ["calendar-schedule", "index-list"]),
    ("Project tracker for an agency with tasks, sprints, time tracking and client sign-off.",
     ["project-management", "professional-services"], ["Task", "Sprint", "Time entry", "Client"], ["board-kanban", "index-list"]),
    ("Note taking app with folders, tags and shared notebooks.",
     ["productivity"], ["Note", "Folder", "Tag", "Notebook"], ["workspace-editor", "index-list"]),
    ("API platform for developers: manage API keys, read docs, see usage and upgrade plans.",
     ["developer-tools", "saas"], ["API key", "Usage", "Plan"], ["analytics-reporting", "billing-account"]),
    ("Customer feedback survey builder: teams create surveys, share links and analyse responses.",
     ["survey-forms", "saas"], ["Survey", "Question", "Response"], ["workspace-editor", "analytics-reporting"]),
    ("Community forum for amateur astronomers to post observations, comment and follow topics.",
     ["community-forum", "social-network"], ["Post", "Comment", "Topic", "Member"], ["index-list", "detail-entity"]),
    ("Podcast hosting: creators upload episodes, see listener stats and earn from subscriptions.",
     ["creator", "media"], ["Episode", "Creator", "Subscription", "Listener"], ["analytics-reporting", "index-list"]),
    ("Language learning app with daily lessons, streaks and speaking practice. Playful and encouraging.",
     ["education", "consumer"], ["Lesson", "Streak"], ["index-list"]),
    ("University module registration: students choose modules, see timetables and check grades.",
     ["education", "school-admin"], ["Student", "Module", "Timetable", "Grade"], ["calendar-schedule", "index-list"]),
    ("Tutoring marketplace: parents find tutors by subject, book lessons and leave reviews.",
     ["marketplace", "education", "booking-scheduling"], ["Tutor", "Parent", "Lesson", "Review", "Subject"], ["search-explore", "booking-flow"]),
    ("Car garage booking: customers book MOTs and services, mechanics update job status and send invoices.",
     ["automotive", "booking-scheduling", "local-business"], ["Customer", "Vehicle", "Job", "Invoice", "Booking"], ["booking-flow", "board-kanban"]),
    ("Farm management app for tracking fields, crops, harvests and machinery maintenance.",
     ["agriculture"], ["Field", "Crop", "Harvest", "Machinery"], ["index-list", "map-explore"]),
    ("Smart building sensors dashboard: facility managers watch temperature and get alerts on faults.",
     ["iot-monitoring", "energy-utilities"], ["Sensor", "Alert", "Building"], ["analytics-reporting", "index-list"]),
    ("Fundraising platform for schools where parents sponsor runs and donate.",
     ["nonprofit-fundraising"], ["Donation", "Sponsor", "Campaign"], ["checkout-transaction", "index-list"]),
    ("Trip planner where friends build itineraries together and split costs.",
     ["travel", "consumer"], ["Trip", "Itinerary", "Expense"], ["workspace-editor", "index-list"]),
    ("Wedding venue: couples check available dates, book a viewing and pay a deposit.",
     ["events-ticketing", "booking-scheduling", "local-business"], ["Couple", "Date", "Viewing", "Deposit"], ["calendar-schedule", "booking-flow", "checkout-transaction"]),
    ("Cleaning company: customers book regular cleans, cleaners get their rota and checklists.",
     ["local-business", "booking-scheduling", "fleet-field-service"], ["Customer", "Clean", "Cleaner", "Checklist"], ["booking-flow", "calendar-schedule"]),
    ("Security compliance tool tracking controls, evidence and audits for SOC 2.",
     ["security-compliance"], ["Control", "Evidence", "Audit"], ["index-list", "analytics-reporting"]),
    ("Music streaming for indie artists: listeners follow artists, build playlists and stream tracks.",
     ["music-streaming", "media"], ["Artist", "Playlist", "Track", "Listener"], ["search-explore", "index-list"]),
    ("Dating app for hikers with profiles, matches and chat.",
     ["dating", "social-network"], ["Profile", "Match", "Message"], ["messages-collaboration", "search-explore"]),
    ("Research team knowledge base where analysts write reports, cite sources and share findings.",
     ["intelligence-research", "productivity"], ["Report", "Source", "Finding"], ["workspace-editor", "index-list"]),
    ("Manufacturing line monitoring with work orders, machine downtime and quality checks.",
     ["manufacturing", "erp-operations"], ["Work order", "Machine", "Downtime", "Quality check"], ["analytics-reporting", "index-list"]),
    ("Crypto portfolio tracker that shows holdings, prices and transaction history.",
     ["crypto", "personal-finance"], ["Holding", "Price", "Transaction"], ["analytics-reporting", "index-list"]),
    ("Photographer portfolio with galleries and a contact form for booking enquiries.",
     ["portfolio", "creator"], ["Gallery", "Enquiry"], ["index-list", "form-flow"]),
]

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "holdout2.jsonl")
    with open(out, "w", encoding="utf-8") as f:
        for b, a, e, s in EVAL:
            f.write(json.dumps({"brief": b, "archetypes": a, "entities": e, "screens": s}, ensure_ascii=False) + "\n")
    print(f"{len(EVAL)} evaluation briefs written to {out}")
