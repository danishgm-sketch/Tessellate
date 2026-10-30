# Step 46 — Human usability testing

Status: **waived by the owner on 2026-10-30; not passed**. The owner directed completion of the technical hardening goal with a human-validation waiver. No unfamiliar participants were recruited or observed, and no participant evidence is claimed. The waiver applies only to the external 5–10-person moderated study described below; it does not waive browser, accessibility, security, CI, deployed-runtime, cost, licensing, or release checks. Automated evidence remains separate from human usability evidence.

## Study goal

Observe whether people who have not used Tessellate can understand the product and complete:

`homepage → understand → compose → choose → edit → export`

Run 5–10 sessions with people spanning these backgrounds:

- frontend developer;
- product or interface designer;
- product manager;
- developer who uses an AI coding agent;
- technically capable newcomer.

One person may cover more than one background, but record the participant's primary perspective. Use anonymized IDs (`P01`–`P10`) in notes and filenames.

## Participant task

Start each participant on the public review Site homepage at desktop or mobile. Give them this goal without describing the controls or architecture:

> Create a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative. Choose the direction you think fits, refine it, and export a project you could continue working on.

Allow the participant to decide how to proceed. Do not point out Compose, explain Design DNA, name the Workbench, or tell them which controls to use. If they ask for help, ask what they would try next and record the request before offering a neutral prompt. Stop assistance only if they are blocked or ask to stop.

## Session procedure

1. Explain that the product is being evaluated, not the participant. Ask permission to take anonymized notes. Ask separately before making an audio/video recording or saving identifiable screen content; recording is optional.
2. Record participant ID, primary background, device class, viewport, browser, and session date. Do not collect names, employer names, credentials, or private product data.
3. Start the timer when the goal is given. Observe silently and record clicks, backtracking, hesitation, misunderstood terms, missed controls, errors, recoveries, and requests for help.
4. Stop the task when the participant exports a project, gives up, or reaches the 45-minute session limit. Record completion status and elapsed time; do not turn a partial result into a pass.
5. Ask what they expected to happen, what felt unclear, whether they trust the export, and what they would do next. Keep answers in the participant's words, anonymized.
6. If the participant agrees, inspect the exported project in a clean directory and record whether install, build, and preview succeeded. Do not use Tessellate's repository dependencies for this check.
7. After each session, map each distinct observation to an audit finding or confirm that a matching finding already exists. Keep quotes and evidence tied to participant IDs only.

## Evidence to capture

For each session, record:

- task completion (`unassisted`, `assisted`, `incomplete`, or `stopped`);
- elapsed time and number of assistance requests;
- first point of hesitation and where the participant stopped, if applicable;
- terms they misunderstood and controls they missed;
- dead ends, errors, recovery attempts, and expectation mismatches;
- whether the generated product matched the goal and which direction they chose;
- whether the export was usable and the clean-install result when tested;
- screenshots or recordings only when the participant has agreed to those captures;
- candidate severity, reproduction notes, and links to existing/new audit IDs.

Use `quality/evidence/step-46/participant-observations-template.csv` as a blank log. Keep one row per participant/task observation, use anonymized IDs, and do not fill it with synthetic data.

## Exit gate

Normally, Step 46 closes only after 5–10 unfamiliar people complete observed sessions, results are recorded, and product changes or accepted limitations are linked to findings. The sessions must exercise the goal above without facilitator instructions. Without an explicit owner waiver, failure to recruit keeps this step open; automation or a staff walkthrough cannot substitute. For the current release gate, the owner waiver in D-064 is the sole exception: it changes the step status to waived, not passed, and does not create participant evidence.

## Current state

- Participants recruited: 0
- Sessions observed: 0
- Findings added from human sessions: 0
- Session evidence: none
- Owner disposition: external participant study waived for this release gate; this step is **waived, not passed**.
- Waiver scope: the 5–10 unfamiliar-participant study and its recruitment/session requirement only. The deployed flagship workflow, route audit, responsive matrix, Axe scans, export build, and other technical evidence remain required and are recorded independently in Step 45.
- Recruitment invitation: [public GitHub issue #7](https://github.com/danishgm-sketch/Tessellate/issues/7), opened 2026-10-28; 0 comments at 2026-10-30 13:57 UTC
- Additional recruitment outreach: [PR #5 comment](https://github.com/danishgm-sketch/Tessellate/pull/5#issuecomment-6479912997), posted 2026-10-28; invites suitable people to opt in through issue #7 and asks them not to post personal details
- Session coordination method: not set; issue states this will be confirmed before collecting any further details
- Additional channel check: the public r/alphaandbetausers rules URL redirected to Reddit's "Prove your humanity" CAPTCHA on 2026-10-30. No challenge was attempted and no post was submitted.
