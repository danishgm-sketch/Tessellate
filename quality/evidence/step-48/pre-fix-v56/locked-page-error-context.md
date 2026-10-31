# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workbench-page-locks.spec.ts >> Pages cannot delete a screen whose descendant is locked
- Location: tests\e2e\workbench-page-locks.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Select screen Settings & Policies' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Select screen Settings & Policies' }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Select screen Settings & Policies' })

```

```yaml
- link "Skip to editor":
  - /url: "#workbench-main"
- banner:
  - link "T":
    - /url: /
  - button "Example employee workspace"
  - img
  - text: Local Saved
  - link "Compose":
    - /url: /compose
    - img
    - text: Compose
  - button "structure" [pressed]
  - button "style"
  - button "motion"
  - button "content"
  - button "audit"
  - button "Recompose":
    - img
    - text: Recompose
  - button "Surprise":
    - img
    - text: Surprise
  - button "Blend":
    - img
    - text: Blend
  - button "Compare":
    - img
    - text: Compare
  - button "Snapshots (1)":
    - img
    - text: Snapshots (1)
  - button "Undo":
    - img
  - button "Redo" [disabled]:
    - img
  - button "Preview":
    - img
    - text: Preview
  - button "Export":
    - img
    - text: Export
    - img
- main "Workbench editor":
  - 'heading "Workbench: Example employee workspace" [level=1]'
  - complementary "Workbench navigation":
    - button "Layers":
      - img
      - text: Layers
    - button "Pages":
      - img
      - text: Pages
    - button "Library":
      - img
      - text: Library
    - button "Brief":
      - img
      - text: Brief
    - text: Screens & Navigation (6)
    - button "Add Page":
      - img
      - text: Add Page
    - button "Select screen Marketing Home" [pressed]:
      - img
      - text: Marketing Home Req /
    - button "Duplicate Marketing Home":
      - img
    - button "Delete Marketing Home":
      - img
    - button "Select screen Team Overview":
      - img
      - text: Team Overview Req /overview
    - button "Duplicate Team Overview":
      - img
    - button "Delete Team Overview":
      - img
    - button "Select screen People Directory":
      - img
      - text: People Directory Req /people
    - button "Duplicate People Directory":
      - img
    - button "Delete People Directory":
      - img
    - button "Select screen Teams":
      - img
      - text: Teams Req /teams
    - button "Duplicate Teams":
      - img
    - button "Delete Teams":
      - img
    - button "Select screen Engagement":
      - img
      - text: Engagement Req /engagement
    - button "Duplicate Engagement":
      - img
    - button "Delete Engagement":
      - img
    - button "Select screen Onboarding":
      - img
      - text: Onboarding Req /onboarding
    - button "Duplicate Onboarding":
      - img
    - button "Delete Onboarding":
      - img
  - button "Marketing Home":
    - img
    - text: Marketing Home
  - button "Fluid":
    - img
    - text: Fluid
  - button "1440":
    - img
    - text: "1440"
  - button "1280":
    - img
    - text: "1280"
  - button "1024":
    - img
    - text: "1024"
  - button "768":
    - img
    - text: "768"
  - button "430":
    - img
    - text: "430"
  - button "360":
    - img
    - text: "360"
  - button "390":
    - img
    - text: "390"
  - button "Zoom Out":
    - img
  - text: 100%
  - button "Zoom In":
    - img
  - button "100%"
  - button "Motion":
    - img
    - text: Motion
  - button "Preview":
    - img
    - text: Preview
  - text: People & Co
  - navigation "Product screens":
    - link "Marketing Home":
      - /url: "#screen-marketing-home"
    - link "Team Overview":
      - /url: "#screen-overview"
    - link "People Directory":
      - /url: "#screen-collection-index"
    - link "Teams":
      - /url: "#screen-teams"
    - link "Engagement":
      - /url: "#screen-engagement"
  - text: Example organisation · sample content
  - heading "A better workday starts with people." [level=1]
  - paragraph: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
  - link "Meet your team":
    - /url: "#screen-teams"
  - link "Explore onboarding":
    - /url: "#screen-onboarding"
  - paragraph: Example interface · replace sample data with your organisation
  - heading "Made for everyday employee experiences" [level=2]
  - text: Flagship Feature
  - heading "A warm welcome" [level=3]
  - paragraph: Meet your buddy, discover your team and complete onboarding at your own pace.
  - text: Onboarding Everyday experience
  - heading "People, connected" [level=3]
  - paragraph: Find colleagues and understand the teams around you.
  - text: People directory
  - heading "A voice for everyone" [level=3]
  - paragraph: Make space for feedback, recognition and conversations.
  - text: Engagement
  - heading "Clarity you can trust" [level=3]
  - paragraph: Keep organisational policies and account preferences easy to find.
  - heading "Make the next step easier for every colleague." [level=2]
  - paragraph: Help colleagues find their team, support and policies in one clear place.
  - link "Meet your team →":
    - /url: "#screen-teams"
  - text: People & Co
  - paragraph: A people-first home for onboarding, teams and trusted policies.
  - text: Example interface Explore
  - list:
    - listitem:
      - link "Marketing Home":
        - /url: "#screen-marketing-home"
    - listitem:
      - link "Team Overview":
        - /url: "#screen-overview"
    - listitem:
      - link "People Directory":
        - /url: "#screen-collection-index"
    - listitem:
      - link "Teams":
        - /url: "#screen-teams"
    - listitem:
      - link "Engagement":
        - /url: "#screen-engagement"
    - listitem:
      - link "Settings & Policies":
        - /url: "#screen-settings"
  - complementary "Workbench inspector":
    - text: Project Scope Example employee workspace
    - button "Intent":
      - img
      - text: Intent
    - button "Style":
      - img
      - text: Style
    - button "Motion":
      - img
      - text: Motion
    - button "Content":
      - img
      - text: Content
    - button "Locks":
      - img
      - text: Locks
    - button "Resource":
      - img
      - text: Resource
    - group:
      - group:
        - img
        - text: Feel Mixer (5 Pinned Traits) Professionalism Project 100
        - slider "Professionalism": "100"
        - text: Playfulness Project 53
        - slider "Playfulness": "53"
        - text: Warmth Project 45
        - slider "Warmth": "45"
        - text: Technicality Project 65
        - slider "Technicality": "65"
        - text: Luxury Project 40
        - slider "Luxury": "40"
        - text: Add Trait or Feel Phrase
        - textbox "Feel phrase":
          - /placeholder: e.g. professional but playful, dense and technical
        - button "Apply"
      - img
      - text: Visual Ambition Project 30
      - slider "Visual Ambition": "30"
      - text: Refined
      - paragraph: Sophisticated spacing/typography, subtle motion, stronger visual hierarchy, and restrained distinctive details.
      - img
      - text: Structural Creativity Project 40
      - slider "Structural Creativity": "40"
      - text: Modern
      - paragraph: Current polished patterns with mild rethinking.
      - paragraph: Guides composition and replacement matching. This setting does not reorder the current screen by itself.
- region "Workbench command bar":
  - img
  - text: Project Scope
  - textbox "Tessellate command":
    - /placeholder: Tell Tess what to change… (e.g. recompose, surprise me, compare, blend, reduce motion)
  - button "Execute command":
    - img
  - switch "Laptop model Lab Off" [disabled]
  - status "Host features require this laptop and Docker. Local deterministic controls remain available.": Backend offline
  - text: The experimental laptop model is off by default. When enabled, its proposed mutations are not applied until you review and confirm them.
  - status: Press Esc climb parent / command
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('Pages cannot delete a screen whose descendant is locked', async ({ page }) => {
  4  |   await page.goto('/workbench');
  5  |   await expect(page.getByTestId('top-toolbar')).toBeVisible();
  6  | 
  7  |   const mobile = (page.viewportSize()?.width ?? 1440) < 1024;
  8  |   if (mobile) {
  9  |     await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' }).click();
  10 |   } else {
  11 |     await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  12 |   }
  13 |   await page.getByRole('button', { name: 'Select screen Settings & Policies' }).click();
  14 | 
  15 |   if (!mobile) await page.getByTestId('left-panel').getByRole('button', { name: 'Layers', exact: true }).click();
  16 |   const settingsNode = page.getByTestId('layer-node-node-screen-settings-settings-form-2');
  17 |   await expect(settingsNode).toBeVisible();
  18 |   await settingsNode.getByRole('button', { name: 'Lock Settings & Policies' }).click();
  19 | 
  20 |   if (mobile) {
  21 |     await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' }).click();
  22 |   } else {
  23 |     await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  24 |   }
  25 |   await page.getByRole('button', { name: 'Delete Settings & Policies' }).click();
  26 | 
> 27 |   await expect(page.getByRole('button', { name: 'Select screen Settings & Policies' })).toBeVisible();
     |                                                                                         ^ Error: expect(locator).toBeVisible() failed
  28 |   await expect(page.getByRole('status').filter({ hasText: /locked node/i })).toBeVisible();
  29 | });
  30 | 
```