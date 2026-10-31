# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: showcase-content-copy-regression.spec.ts >> employee showcase gives the conversion CTA distinct copy from its hero
- Location: tests\e2e\showcase-content-copy-regression.spec.ts:3:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('heading', { name: 'A better workday starts with people.', exact: true })
Expected: 1
Received: 2
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByRole('heading', { name: 'A better workday starts with people.', exact: true }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'A better workday starts with people.', exact: true })
    14 × locator resolved to 2 elements
       - unexpected value "2"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "Tessellate" [ref=e7] [cursor=pointer]:
          - /url: /
        - generic [ref=e14]:
          - button "Search ⌘K" [ref=e15]:
            - generic [ref=e19]: Search
            - generic [ref=e20]: ⌘K
          - link "Start building" [ref=e21] [cursor=pointer]:
            - /url: /workbench
            - generic [ref=e22]: Build
          - button "Toggle menu" [ref=e25]
  - main [ref=e27]:
    - generic [ref=e28]:
      - paragraph [ref=e29]: Open interface commons
      - heading "Kudos Employee Experience" [level=1] [ref=e30]
      - paragraph [ref=e31]: Example project. Employee experience platform for people, teams, playful onboarding and peer recognition.
    - complementary "Beta capability notice" [ref=e32]:
      - generic [ref=e33]: Beta
      - generic [ref=e34]: This is a static demonstration project with sample content. Review its manifest and preview before reuse; it is not customer usage evidence.
    - paragraph [ref=e35]:
      - link "Edit a local copy in Workbench" [ref=e36] [cursor=pointer]:
        - /url: /workbench?showcase=showcase-playful-hr
      - link "Download exact example manifest" [ref=e37] [cursor=pointer]:
        - /url: /data/showcases/showcase-playful-hr.json
    - region [ref=e39]:
      - generic [ref=e40]:
        - text: Example screen
        - combobox "Example screen" [ref=e41]:
          - option "Marketing Home" [selected]
          - option "Team Overview"
          - option "People Directory"
          - option "Teams"
          - option "Engagement"
          - option "Onboarding"
          - option "Settings & Policies"
      - 'heading "Example: Marketing Home" [level=2] [ref=e42]'
      - generic "Marketing Home example screen" [ref=e43]:
        - generic [ref=e45]:
          - generic [ref=e49]:
            - generic [ref=e50]: People & Co
            - navigation "Product screens" [ref=e53]:
              - link "Marketing Home" [ref=e54] [cursor=pointer]:
                - /url: "#screen-marketing-home"
              - link "Team Overview" [ref=e55] [cursor=pointer]:
                - /url: "#screen-overview"
              - link "People Directory" [ref=e56] [cursor=pointer]:
                - /url: "#screen-collection-index"
              - link "Teams" [ref=e57] [cursor=pointer]:
                - /url: "#screen-teams"
              - link "Engagement" [ref=e58] [cursor=pointer]:
                - /url: "#screen-engagement"
              - link "Settings & Policies" [ref=e59] [cursor=pointer]:
                - /url: "#screen-settings"
          - generic [ref=e62]:
            - generic [ref=e63]: Example organisation · sample content
            - heading "A better workday starts with people." [level=1] [ref=e65]
            - paragraph [ref=e66]: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
            - generic [ref=e67]:
              - link "Meet your team" [ref=e68] [cursor=pointer]:
                - /url: "#screen-teams"
              - link "Explore onboarding" [ref=e69] [cursor=pointer]:
                - /url: "#screen-onboarding"
            - paragraph [ref=e70]: Example interface · replace sample data with your organisation
          - generic [ref=e73]:
            - heading "Made for everyday employee experiences" [level=2] [ref=e74]
            - generic [ref=e75]:
              - generic [ref=e76]:
                - generic [ref=e77]:
                  - generic [ref=e78]: Flagship Feature
                  - heading "A warm welcome" [level=3] [ref=e79]
                  - paragraph [ref=e80]: Meet your buddy, discover your team and complete onboarding at your own pace.
                - generic [ref=e81]: Onboarding
              - generic [ref=e82]:
                - generic [ref=e83]:
                  - generic [ref=e84]: Everyday experience
                  - heading "People, connected" [level=3] [ref=e85]
                  - paragraph [ref=e86]: Find colleagues and understand the teams around you.
                - generic [ref=e87]: People directory
              - generic [ref=e88]:
                - generic [ref=e89]:
                  - heading "A voice for everyone" [level=3] [ref=e90]
                  - paragraph [ref=e91]: Make space for feedback, recognition and conversations.
                - generic [ref=e92]: Engagement
              - generic [ref=e94]:
                - heading "Clarity you can trust" [level=3] [ref=e95]
                - paragraph [ref=e96]: Keep organisational policies and account preferences easy to find.
          - generic [ref=e103]:
            - heading "A better workday starts with people." [level=2] [ref=e104]
            - paragraph [ref=e105]: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
            - link "Meet your team →" [ref=e106] [cursor=pointer]:
              - /url: "#screen-teams"
          - generic [ref=e109]:
            - generic [ref=e110]:
              - generic [ref=e111]: People & Co
              - paragraph [ref=e112]: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
              - generic [ref=e113]: Example interface
            - generic [ref=e117]:
              - generic [ref=e118]: Explore
              - list [ref=e119]:
                - listitem [ref=e120]:
                  - link "Marketing Home" [ref=e121] [cursor=pointer]:
                    - /url: "#screen-marketing-home"
                - listitem [ref=e122]:
                  - link "Team Overview" [ref=e123] [cursor=pointer]:
                    - /url: "#screen-overview"
                - listitem [ref=e124]:
                  - link "People Directory" [ref=e125] [cursor=pointer]:
                    - /url: "#screen-collection-index"
                - listitem [ref=e126]:
                  - link "Teams" [ref=e127] [cursor=pointer]:
                    - /url: "#screen-teams"
                - listitem [ref=e128]:
                  - link "Engagement" [ref=e129] [cursor=pointer]:
                    - /url: "#screen-engagement"
                - listitem [ref=e130]:
                  - link "Settings & Policies" [ref=e131] [cursor=pointer]:
                    - /url: "#screen-settings"
      - generic [ref=e132]:
        - generic [ref=e133]:
          - term [ref=e134]: Navigation model
          - definition [ref=e135]: rail
        - generic [ref=e136]:
          - term [ref=e137]: Visual ambition
          - definition [ref=e138]: "70"
        - generic [ref=e139]:
          - term [ref=e140]: Structural creativity
          - definition [ref=e141]: "65"
  - contentinfo [ref=e142]:
    - navigation "Footer" [ref=e143]:
      - link "About" [ref=e144] [cursor=pointer]:
        - /url: /about
      - link "Docs" [ref=e145] [cursor=pointer]:
        - /url: /docs
      - link "Licences" [ref=e146] [cursor=pointer]:
        - /url: /license
      - link "Privacy" [ref=e147] [cursor=pointer]:
        - /url: /privacy
      - link "Terms" [ref=e148] [cursor=pointer]:
        - /url: /terms
      - link "Support the commons" [ref=e149] [cursor=pointer]:
        - /url: /sponsor
      - link "Source on GitHub" [ref=e150] [cursor=pointer]:
        - /url: https://github.com/danishgm-sketch/Tessellate
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('employee showcase gives the conversion CTA distinct copy from its hero', async ({ page }) => {
  4  |   await page.goto('/showcase/showcase-playful-hr/');
  5  | 
  6  |   await expect(
  7  |     page.getByRole('heading', { name: 'A better workday starts with people.', exact: true })
> 8  |   ).toHaveCount(1);
     |     ^ Error: expect(locator).toHaveCount(expected) failed
  9  |   await expect(
  10 |     page.getByRole('heading', {
  11 |       name: 'Make the next step easier for every colleague.',
  12 |       exact: true,
  13 |     })
  14 |   ).toBeVisible();
  15 |   await expect(
  16 |     page.getByText('Help colleagues find their team, support and policies in one clear place.', {
  17 |       exact: true,
  18 |     })
  19 |   ).toBeVisible();
  20 | });
  21 | 
```