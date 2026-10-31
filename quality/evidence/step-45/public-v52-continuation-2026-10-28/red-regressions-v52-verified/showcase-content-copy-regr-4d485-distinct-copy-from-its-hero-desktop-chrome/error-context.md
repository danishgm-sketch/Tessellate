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
        - generic [ref=e6]:
          - link "Tessellate" [ref=e7] [cursor=pointer]:
            - /url: /
          - navigation [ref=e14]:
            - link "Explore" [ref=e15] [cursor=pointer]:
              - /url: /explore
            - link "Showcases" [ref=e16] [cursor=pointer]:
              - /url: /showcases
            - link "Compose" [ref=e17] [cursor=pointer]:
              - /url: /compose
            - link "Workbench" [ref=e18] [cursor=pointer]:
              - /url: /workbench
            - link "Tools" [ref=e19] [cursor=pointer]:
              - /url: /tools
            - link "Agents" [ref=e20] [cursor=pointer]:
              - /url: /agents
            - link "Creators" [ref=e21] [cursor=pointer]:
              - /url: /creators
            - link "Docs" [ref=e22] [cursor=pointer]:
              - /url: /docs
        - generic [ref=e23]:
          - button "Search ⌘K" [ref=e24]:
            - generic [ref=e28]: Search
            - generic [ref=e29]: ⌘K
          - link "GitHub Repository" [ref=e30] [cursor=pointer]:
            - /url: https://github.com/danishgm-sketch/Tessellate
          - link "Local projects" [ref=e34] [cursor=pointer]:
            - /url: /workbench
          - link "Start building" [ref=e35] [cursor=pointer]:
            - /url: /workbench
  - main [ref=e39]:
    - generic [ref=e40]:
      - paragraph [ref=e41]: Open interface commons
      - heading "Kudos Employee Experience" [level=1] [ref=e42]
      - paragraph [ref=e43]: Example project. Employee experience platform for people, teams, playful onboarding and peer recognition.
    - complementary "Beta capability notice" [ref=e44]:
      - generic [ref=e45]: Beta
      - generic [ref=e46]: This is a static demonstration project with sample content. Review its manifest and preview before reuse; it is not customer usage evidence.
    - paragraph [ref=e47]:
      - link "Edit a local copy in Workbench" [ref=e48] [cursor=pointer]:
        - /url: /workbench?showcase=showcase-playful-hr
      - link "Download exact example manifest" [ref=e49] [cursor=pointer]:
        - /url: /data/showcases/showcase-playful-hr.json
    - region [ref=e51]:
      - generic [ref=e52]:
        - text: Example screen
        - combobox "Example screen" [ref=e53]:
          - option "Marketing Home" [selected]
          - option "Team Overview"
          - option "People Directory"
          - option "Teams"
          - option "Engagement"
          - option "Onboarding"
          - option "Settings & Policies"
      - 'heading "Example: Marketing Home" [level=2] [ref=e54]'
      - generic "Marketing Home example screen" [ref=e55]:
        - generic [ref=e57]:
          - generic [ref=e61]:
            - generic [ref=e62]: People & Co
            - navigation "Product screens" [ref=e65]:
              - link "Marketing Home" [ref=e66] [cursor=pointer]:
                - /url: "#screen-marketing-home"
              - link "Team Overview" [ref=e67] [cursor=pointer]:
                - /url: "#screen-overview"
              - link "People Directory" [ref=e68] [cursor=pointer]:
                - /url: "#screen-collection-index"
              - link "Teams" [ref=e69] [cursor=pointer]:
                - /url: "#screen-teams"
              - link "Engagement" [ref=e70] [cursor=pointer]:
                - /url: "#screen-engagement"
              - link "Settings & Policies" [ref=e71] [cursor=pointer]:
                - /url: "#screen-settings"
          - generic [ref=e74]:
            - generic [ref=e75]: Example organisation · sample content
            - heading "A better workday starts with people." [level=1] [ref=e77]
            - paragraph [ref=e78]: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
            - generic [ref=e79]:
              - link "Meet your team" [ref=e80] [cursor=pointer]:
                - /url: "#screen-teams"
              - link "Explore onboarding" [ref=e81] [cursor=pointer]:
                - /url: "#screen-onboarding"
            - paragraph [ref=e82]: Example interface · replace sample data with your organisation
          - generic [ref=e85]:
            - heading "Made for everyday employee experiences" [level=2] [ref=e86]
            - generic [ref=e87]:
              - generic [ref=e88]:
                - generic [ref=e89]:
                  - generic [ref=e90]: Flagship Feature
                  - heading "A warm welcome" [level=3] [ref=e91]
                  - paragraph [ref=e92]: Meet your buddy, discover your team and complete onboarding at your own pace.
                - generic [ref=e93]: Onboarding
              - generic [ref=e94]:
                - generic [ref=e95]:
                  - generic [ref=e96]: Everyday experience
                  - heading "People, connected" [level=3] [ref=e97]
                  - paragraph [ref=e98]: Find colleagues and understand the teams around you.
                - generic [ref=e99]: People directory
              - generic [ref=e100]:
                - generic [ref=e101]:
                  - heading "A voice for everyone" [level=3] [ref=e102]
                  - paragraph [ref=e103]: Make space for feedback, recognition and conversations.
                - generic [ref=e104]: Engagement
              - generic [ref=e106]:
                - heading "Clarity you can trust" [level=3] [ref=e107]
                - paragraph [ref=e108]: Keep organisational policies and account preferences easy to find.
          - generic [ref=e115]:
            - heading "A better workday starts with people." [level=2] [ref=e116]
            - paragraph [ref=e117]: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
            - link "Meet your team →" [ref=e118] [cursor=pointer]:
              - /url: "#screen-teams"
          - generic [ref=e121]:
            - generic [ref=e122]:
              - generic [ref=e123]: People & Co
              - paragraph [ref=e124]: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
              - generic [ref=e125]: Example interface
            - generic [ref=e129]:
              - generic [ref=e130]: Explore
              - list [ref=e131]:
                - listitem [ref=e132]:
                  - link "Marketing Home" [ref=e133] [cursor=pointer]:
                    - /url: "#screen-marketing-home"
                - listitem [ref=e134]:
                  - link "Team Overview" [ref=e135] [cursor=pointer]:
                    - /url: "#screen-overview"
                - listitem [ref=e136]:
                  - link "People Directory" [ref=e137] [cursor=pointer]:
                    - /url: "#screen-collection-index"
                - listitem [ref=e138]:
                  - link "Teams" [ref=e139] [cursor=pointer]:
                    - /url: "#screen-teams"
                - listitem [ref=e140]:
                  - link "Engagement" [ref=e141] [cursor=pointer]:
                    - /url: "#screen-engagement"
                - listitem [ref=e142]:
                  - link "Settings & Policies" [ref=e143] [cursor=pointer]:
                    - /url: "#screen-settings"
      - generic [ref=e144]:
        - generic [ref=e145]:
          - term [ref=e146]: Navigation model
          - definition [ref=e147]: rail
        - generic [ref=e148]:
          - term [ref=e149]: Visual ambition
          - definition [ref=e150]: "70"
        - generic [ref=e151]:
          - term [ref=e152]: Structural creativity
          - definition [ref=e153]: "65"
  - contentinfo [ref=e154]:
    - navigation "Footer" [ref=e155]:
      - link "About" [ref=e156] [cursor=pointer]:
        - /url: /about
      - link "Docs" [ref=e157] [cursor=pointer]:
        - /url: /docs
      - link "Licences" [ref=e158] [cursor=pointer]:
        - /url: /license
      - link "Privacy" [ref=e159] [cursor=pointer]:
        - /url: /privacy
      - link "Terms" [ref=e160] [cursor=pointer]:
        - /url: /terms
      - link "Support the commons" [ref=e161] [cursor=pointer]:
        - /url: /sponsor
      - link "Source on GitHub" [ref=e162] [cursor=pointer]:
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