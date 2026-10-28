# Step 46 — Human usability testing

Status: **not complete**. Study materials are prepared, but no unfamiliar participants have been recruited or observed. Do not treat automated Playwright runs, internal product familiarity, or simulated personas as participant evidence.

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

Step 46 can close only after 5–10 unfamiliar people have completed observed sessions, the results are recorded, and the product changes or accepted limitations are linked to findings. The sessions must exercise the goal above without facilitator instructions. If nobody can be recruited, keep this step open and report that dependency; do not substitute an automated run or a staff walkthrough.

## Current state

- Participants recruited: 0
- Sessions observed: 0
- Findings added from human sessions: 0
- Session evidence: none
- Recruitment invitation: [public GitHub issue #7](https://github.com/danishgm-sketch/Tessellate/issues/7), opened 2026-10-28; 0 comments at last check
- Session coordination method: not set; issue states this will be confirmed before collecting any further details
