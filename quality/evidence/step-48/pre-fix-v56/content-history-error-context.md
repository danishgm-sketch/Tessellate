# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workbench-content-history.spec.ts >> structured content drafts follow undo and redo of the applied project value
- Location: tests\e2e\workbench-content-history.spec.ts:3:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

@@ -1,10 +1,10 @@
  Array [
    Object {
      "displayValue": "Progress not connected",
      "id": 1,
-     "name": "Example colleague A",
+     "name": "Edited employee record",
      "quality": 80,
      "status": "Onboarding",
      "type": "Product team",
    },
    Object {

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to editor" [ref=e4] [cursor=pointer]:
    - /url: "#workbench-main"
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "T" [ref=e7] [cursor=pointer]:
        - /url: /
      - button "Example employee workspace" [ref=e10]
      - generic "Project and undo history saved on this device" [ref=e11]:
        - generic [ref=e16]: Local
        - generic [ref=e17]: Saved
    - generic [ref=e18]:
      - link "Compose" [ref=e19] [cursor=pointer]:
        - /url: /compose
      - button "structure" [pressed] [ref=e23]
      - button "style" [ref=e24]
      - button "motion" [ref=e25]
      - button "content" [ref=e26]
      - button "audit" [ref=e27]
    - generic [ref=e28]:
      - generic [ref=e29]:
        - button "Recompose" [ref=e30]
        - button "Surprise" [ref=e37]
        - button "Blend" [ref=e45]
        - button "Compare" [ref=e49]
        - button "Snapshots (1)" [ref=e55]
      - generic [ref=e60]:
        - button "Undo" [disabled] [ref=e61]
        - button "Redo" [ref=e65]
      - button "Preview" [ref=e70]
      - button "Export" [ref=e76]
  - main "Workbench editor" [ref=e83]:
    - 'heading "Workbench: Example employee workspace" [level=1] [ref=e84]'
    - complementary "Workbench navigation" [ref=e85]:
      - generic [ref=e86]:
        - button "Layers" [ref=e87]
        - button "Pages" [ref=e93]
        - button "Library" [ref=e98]
        - button "Brief" [ref=e102]
      - generic [ref=e107]:
        - generic [ref=e108]: Semantic Tree (Team Overview)
        - tree "Semantic layers" [ref=e110]:
          - generic [ref=e111]:
            - treeitem "Collapse sidebar-shell sidebar-shell Lock sidebar-shell" [ref=e112] [cursor=pointer]:
              - generic [ref=e113]:
                - button "Collapse sidebar-shell" [expanded] [ref=e114]
                - generic [ref=e119]: sidebar-shell
              - button "Lock sidebar-shell" [ref=e121]
            - generic [ref=e125]:
              - treeitem "navigation collapsible-sidebar Lock navigation" [ref=e127] [cursor=pointer]:
                - generic [ref=e128]:
                  - generic [ref=e131]: navigation
                  - generic [ref=e132]: collapsible-sidebar
                - button "Lock navigation" [ref=e134]
              - generic [ref=e138]:
                - treeitem "Collapse main-content-scroll main-content-scroll Lock main-content-scroll" [ref=e139] [cursor=pointer]:
                  - generic [ref=e140]:
                    - button "Collapse main-content-scroll" [expanded] [ref=e141]
                    - generic [ref=e146]: main-content-scroll
                  - button "Lock main-content-scroll" [ref=e148]
                - generic [ref=e152]:
                  - treeitem "Team Overview entity-profile-header Lock Team Overview" [ref=e154] [cursor=pointer]:
                    - generic [ref=e155]:
                      - generic [ref=e159]: Team Overview
                      - generic [ref=e160]: entity-profile-header
                    - button "Lock Team Overview" [ref=e162]
                  - treeitem "Your organisation at a glance dashboard-kpi-grid Lock Your organisation at a glance" [ref=e167] [cursor=pointer]:
                    - generic [ref=e168]:
                      - generic [ref=e172]: Your organisation at a glance
                      - generic [ref=e173]: dashboard-kpi-grid
                    - button "Lock Your organisation at a glance" [ref=e175]
                  - treeitem "People updates timeline Lock People updates" [ref=e180] [cursor=pointer]:
                    - generic [ref=e181]:
                      - generic [ref=e185]: People updates
                      - generic [ref=e186]: timeline
                    - button "Lock People updates" [ref=e188]
                  - treeitem "People and teams advanced-data-table Lock People and teams" [selected] [ref=e193] [cursor=pointer]:
                    - generic [ref=e194]:
                      - generic [ref=e198]: People and teams
                      - generic [ref=e199]: advanced-data-table
                    - button "Lock People and teams" [ref=e201]
        - region "Selected layer actions" [ref=e205]:
          - generic [ref=e206]: "Selected: People and teams"
          - generic [ref=e207]:
            - button "Duplicate" [ref=e208]
            - button "Move up" [ref=e212]
            - button "Move down" [disabled] [ref=e215]
            - button "Delete" [ref=e218]
    - generic [ref=e222]:
      - generic [ref=e224]:
        - button "Team Overview" [ref=e225]
        - button "sidebar-shell" [ref=e232]
        - button "main-content-scroll" [ref=e236]
        - button "People and teams" [ref=e240]
        - generic [ref=e242]: (Esc to climb)
      - generic [ref=e244]:
        - generic [ref=e245]:
          - button "Fluid" [ref=e246]
          - button "1440" [ref=e253]
          - button "1280" [ref=e257]
          - button "1024" [ref=e261]
          - button "768" [ref=e265]
          - button "430" [ref=e269]
          - button "360" [ref=e273]
          - button "390" [ref=e277]
        - generic [ref=e282]:
          - button "Zoom Out" [ref=e283]
          - generic [ref=e287]: 100%
          - button "Zoom In" [ref=e288]
          - button "100%" [ref=e292]
        - button "Motion" [ref=e294]
        - button "Preview" [ref=e300]
      - generic [ref=e309]:
        - complementary [ref=e311]:
          - generic [ref=e312]:
            - generic [ref=e313]: People & Co
            - button "Collapse navigation" [expanded] [ref=e314]: −
          - navigation "Workspace screens" [ref=e315]:
            - link "Marketing Home" [ref=e316] [cursor=pointer]:
              - /url: "#screen-marketing-home"
            - link "Team Overview" [ref=e317] [cursor=pointer]:
              - /url: "#screen-overview"
            - link "People Directory" [ref=e318] [cursor=pointer]:
              - /url: "#screen-collection-index"
            - link "Teams" [ref=e319] [cursor=pointer]:
              - /url: "#screen-teams"
            - link "Engagement" [ref=e320] [cursor=pointer]:
              - /url: "#screen-engagement"
            - link "Settings & Policies" [ref=e321] [cursor=pointer]:
              - /url: "#screen-settings"
        - generic [ref=e322]:
          - generic [ref=e326]:
            - generic [ref=e327]: PC
            - generic [ref=e328]:
              - generic [ref=e329]:
                - heading "Team Overview" [level=2] [ref=e330]
                - generic [ref=e331]: EXAMPLE
              - paragraph [ref=e332]: Refined employee summary and upcoming team actions
          - generic [ref=e334]:
            - heading "Your organisation at a glance" [level=3] [ref=e335]
            - generic [ref=e336]:
              - generic [ref=e337]:
                - generic [ref=e338]: People
                - generic [ref=e339]: —
                - text: No connected data
              - generic [ref=e340]:
                - generic [ref=e341]: Onboarding
                - generic [ref=e342]: —
                - text: No connected data
              - generic [ref=e343]:
                - generic [ref=e344]: Team pulse
                - generic [ref=e345]: —
                - text: No connected data
          - generic [ref=e347]:
            - heading "People updates" [level=3] [ref=e348]
            - generic [ref=e349]:
              - generic [ref=e350]:
                - generic [ref=e352]: Today
                - generic [ref=e353]: Welcome to the team
                - paragraph [ref=e354]: Meet your onboarding buddy and introduce yourself to colleagues.
              - generic [ref=e355]:
                - generic [ref=e357]: This week
                - generic [ref=e358]: Team check-in
                - paragraph [ref=e359]: Share how your first week is going and ask for support.
              - generic [ref=e360]:
                - generic [ref=e362]: Next milestone
                - generic [ref=e363]: Policies and preferences
                - paragraph [ref=e364]: Review organisational guidance and choose your notification preferences.
          - generic [ref=e366]:
            - generic [ref=e367]:
              - generic [ref=e368]: People and teams · 0 selected
              - textbox "Filter People and teams" [ref=e369]:
                - /placeholder: Filter records
            - region "People and teams table" [ref=e370]:
              - table [ref=e371]:
                - rowgroup [ref=e372]:
                  - row [ref=e373]:
                    - columnheader "#" [ref=e374]
                    - columnheader "Colleague" [ref=e375]
                    - columnheader "Team" [ref=e376]
                    - columnheader "Progress" [ref=e377]
                    - columnheader "Status" [ref=e378]
                - rowgroup [ref=e379]:
                  - row [ref=e380]:
                    - cell [ref=e381]:
                      - checkbox "Select Example colleague A" [ref=e382] [cursor=pointer]
                    - cell "Example colleague A" [ref=e383]
                    - cell "Product team" [ref=e384]
                    - cell "Progress not connected" [ref=e385]
                    - cell "Onboarding" [ref=e386]
                  - row [ref=e387]:
                    - cell [ref=e388]:
                      - checkbox "Select Example colleague B" [ref=e389] [cursor=pointer]
                    - cell "Example colleague B" [ref=e390]
                    - cell "Engineering team" [ref=e391]
                    - cell "Progress not connected" [ref=e392]
                    - cell "Settled in" [ref=e393]
                  - row [ref=e394]:
                    - cell [ref=e395]:
                      - checkbox "Select Example colleague C" [ref=e396] [cursor=pointer]
                    - cell "Example colleague C" [ref=e397]
                    - cell "People team" [ref=e398]
                    - cell "Progress not connected" [ref=e399]
                    - cell "Welcome week" [ref=e400]
    - complementary "Workbench inspector" [ref=e401]:
      - generic [ref=e402]:
        - generic [ref=e403]:
          - generic [ref=e404]: "Node: block"
          - generic [ref=e405]: People and teams
        - button "Deselect Node" [ref=e407]
      - generic [ref=e411]:
        - button "Intent" [ref=e412]
        - button "Style" [ref=e416]
        - button "Motion" [ref=e424]
        - button "Content" [ref=e428]
        - button "Locks" [ref=e432]
        - button "Resource" [ref=e436]
      - generic [ref=e442]:
        - 'heading "Content: data-table" [level=3] [ref=e443]'
        - generic [ref=e444]:
          - text: title
          - textbox "title" [ref=e445]: People and teams
        - generic [ref=e446]:
          - generic [ref=e447]:
            - generic [ref=e448]: rows (JSON)
            - textbox "rows JSON" [ref=e449]: "[ { \"id\": 1, \"name\": \"Edited employee record\", \"type\": \"Product team\", \"quality\": 80, \"status\": \"Onboarding\", \"displayValue\": \"Progress not connected\" }, { \"id\": 2, \"name\": \"Example colleague B\", \"type\": \"Engineering team\", \"quality\": 100, \"status\": \"Settled in\", \"displayValue\": \"Progress not connected\" }, { \"id\": 3, \"name\": \"Example colleague C\", \"type\": \"People team\", \"quality\": 40, \"status\": \"Welcome week\", \"displayValue\": \"Progress not connected\" } ]"
          - button "Apply rows" [ref=e450]
        - generic [ref=e451]:
          - generic [ref=e452]:
            - generic [ref=e453]: columnLabels (JSON)
            - textbox "columnLabels JSON" [ref=e454]: "{ \"name\": \"Colleague\", \"type\": \"Team\", \"quality\": \"Progress\", \"status\": \"Status\" }"
          - button "Apply columnLabels" [ref=e455]
  - region "Workbench command bar" [ref=e456]:
    - generic [ref=e457]:
      - generic [ref=e458]: data-table
      - textbox "Tessellate command" [ref=e463]:
        - /placeholder: Tell Tess what to change on data-table… (e.g. recompose, replace, lock, reduce motion)
      - button "Execute command" [ref=e464]
    - switch "Laptop model Lab Off" [disabled] [ref=e468]:
      - generic [ref=e469]: Laptop model
      - generic [ref=e470]: Lab
      - generic [ref=e471]: "Off"
    - status "Host features require this laptop and Docker. Local deterministic controls remain available." [ref=e472]: Backend offline
    - generic [ref=e473]: The experimental laptop model is off by default. When enabled, its proposed mutations are not applied until you review and confirm them.
    - status [ref=e474]:
      - generic [ref=e475]: Undid the latest project change.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('structured content drafts follow undo and redo of the applied project value', async ({ page }) => {
  4  |   await page.goto('/workbench');
  5  |   await expect(page.getByTestId('top-toolbar')).toBeVisible();
  6  | 
  7  |   const mobile = (page.viewportSize()?.width ?? 1440) < 1024;
  8  |   if (mobile) {
  9  |     await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' }).click();
  10 |   } else {
  11 |     await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  12 |   }
  13 |   await page.getByRole('button', { name: 'Select screen Team Overview' }).click();
  14 |   if (!mobile) await page.getByTestId('left-panel').getByRole('button', { name: 'Layers', exact: true }).click();
  15 |   await page.getByTestId('layer-node-node-screen-overview-data-table-5').click();
  16 |   if (mobile) {
  17 |     await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  18 |   }
  19 |   await page.getByTestId('right-inspector').getByRole('button', { name: 'Content', exact: true }).click();
  20 | 
  21 |   const rowsField = page.getByRole('textbox', { name: 'rows JSON' });
  22 |   await expect(rowsField).toBeVisible();
  23 |   const original = JSON.parse(await rowsField.inputValue()) as Array<Record<string, unknown>>;
  24 |   const edited = structuredClone(original);
  25 |   edited[0] = { ...edited[0], name: 'Edited employee record' };
  26 | 
  27 |   await rowsField.fill(JSON.stringify(edited, null, 2));
  28 |   await page.getByRole('button', { name: 'Apply rows' }).click();
  29 |   await page.getByRole('button', { name: 'Undo', exact: true }).click();
> 30 |   await expect.poll(async () => JSON.parse(await rowsField.inputValue())).toEqual(original);
     |                                                                           ^ Error: expect(received).toEqual(expected) // deep equality
  31 | 
  32 |   await page.getByRole('button', { name: 'Redo', exact: true }).click();
  33 |   await expect.poll(async () => JSON.parse(await rowsField.inputValue())).toEqual(edited);
  34 | });
  35 | 
```