# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flagship-acceptance-live-v26.spec.ts >> Flagship Acceptance & Merge Gate Verification >> flagship employee experience journey uses the visible UI through independent React export
- Location: tests\e2e\flagship-acceptance-live-v26.spec.ts:183:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 5

- Array []
+ Array [
+   "Executing inline script violates the following Content Security Policy directive 'script-src 'self' 'sha256-1BvDVWLr3QCC20uHhUDi27eDFVJpk1uMQJGIWKUks2I=' 'sha256-UIrFqcaitjA3OKa9mHKajg3N+0Y7tW9+y0o3QmMFeZQ=' 'sha256-0O7iB6zr9x0r6X6eWYITC9V5q+yWCGAoFvcysBGbY9Q=' 'sha256-xIb/Pa7FUshAu4ihwjchYcQpyCI8eS8kt40GpOAYCz8=' 'sha256-Y8t0ntteBwH+PqGKUyjWW3CAk+BNJKSoQc0xZ68FjhM=''. Either the 'unsafe-inline' keyword, a hash ('sha256-hJ+K5wc80hiVQqRihh8bjx3CLzcFYPGCDsFK1nMjVPo='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.",
+   "Executing inline script violates the following Content Security Policy directive 'script-src 'self' 'sha256-1BvDVWLr3QCC20uHhUDi27eDFVJpk1uMQJGIWKUks2I=' 'sha256-UIrFqcaitjA3OKa9mHKajg3N+0Y7tW9+y0o3QmMFeZQ=' 'sha256-0O7iB6zr9x0r6X6eWYITC9V5q+yWCGAoFvcysBGbY9Q=' 'sha256-xIb/Pa7FUshAu4ihwjchYcQpyCI8eS8kt40GpOAYCz8=' 'sha256-Y8t0ntteBwH+PqGKUyjWW3CAk+BNJKSoQc0xZ68FjhM=''. Either the 'unsafe-inline' keyword, a hash ('sha256-R4BV6+9MTkZOVCTsSDR0kzKpCMY7XG7RNK0nNIxemeo='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.",
+   "Executing inline script violates the following Content Security Policy directive 'script-src 'self' 'sha256-1BvDVWLr3QCC20uHhUDi27eDFVJpk1uMQJGIWKUks2I=' 'sha256-UIrFqcaitjA3OKa9mHKajg3N+0Y7tW9+y0o3QmMFeZQ=' 'sha256-0O7iB6zr9x0r6X6eWYITC9V5q+yWCGAoFvcysBGbY9Q=' 'sha256-xIb/Pa7FUshAu4ihwjchYcQpyCI8eS8kt40GpOAYCz8=' 'sha256-Y8t0ntteBwH+PqGKUyjWW3CAk+BNJKSoQc0xZ68FjhM=''. Either the 'unsafe-inline' keyword, a hash ('sha256-HOlcOXuKUNtxEdoukmkCky3cX+pYV8QjYkLQIDg4obs='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f2e3]:
  - link "Skip to editor" [ref=f2e4] [cursor=pointer]:
    - /url: "#workbench-main"
  - banner [ref=f2e5]:
    - generic [ref=f2e6]:
      - link "T" [ref=f2e7] [cursor=pointer]:
        - /url: /
      - button "Adaptive Architecture — Employee experience" [ref=f2e10]
      - generic "Project and undo history saved on this device" [ref=f2e11]:
        - generic [ref=f2e16]: Local
        - generic [ref=f2e17]: Saved
    - generic [ref=f2e18]:
      - link "Compose" [ref=f2e19] [cursor=pointer]:
        - /url: /compose
      - button "structure" [pressed] [ref=f2e23]
      - button "style" [ref=f2e24]
      - button "motion" [ref=f2e25]
      - button "content" [ref=f2e26]
      - button "audit" [ref=f2e27]
    - generic [ref=f2e28]:
      - generic [ref=f2e29]:
        - button "Recompose" [ref=f2e30]
        - button "Surprise" [ref=f2e37]
        - button "Blend" [ref=f2e45]
        - button "Compare" [ref=f2e49]
        - button "Snapshots (2)" [ref=f2e55]
      - generic [ref=f2e60]:
        - button "Undo" [ref=f2e61]
        - button "Redo" [disabled] [ref=f2e65]
      - button "Preview" [ref=f2e70]
      - button "Export" [ref=f2e75]
  - status [ref=f2e82]: Restored the next project change.
  - main "Workbench editor" [ref=f2e83]:
    - 'heading "Workbench: Adaptive Architecture — Employee experience" [level=1] [ref=f2e84]'
    - complementary "Workbench inspector" [ref=f2e85]:
      - generic [ref=f2e87]:
        - generic [ref=f2e88]: Project Scope
        - generic [ref=f2e89]: Adaptive Architecture — Employee experience
      - generic [ref=f2e90]:
        - button "Intent" [ref=f2e91]
        - button "Style" [ref=f2e95]
        - button "Motion" [ref=f2e103]
        - button "Content" [ref=f2e107]
        - button "Locks" [ref=f2e111]
        - button "Resource" [ref=f2e115]
      - paragraph [ref=f2e122]: Select a node to inspect its source resource.
  - navigation "Mobile Workbench" [ref=f2e123]:
    - button "Preview" [ref=f2e124]
    - button "Pages" [ref=f2e129]
    - button "Inspect" [pressed] [ref=f2e134]
    - button "Command" [ref=f2e137]
    - button "Audit" [ref=f2e141]
```

# Test source

```ts
  596 |         const standaloneErrors: string[] = [];
  597 |         standalonePage.on('pageerror', (error) => standaloneErrors.push(error.message));
  598 |         standalonePage.on('console', (message) => {
  599 |           if (message.type() === 'error') standaloneErrors.push(message.text());
  600 |         });
  601 |         try {
  602 |           for (const size of [
  603 |             { width: 1440, height: 900 },
  604 |             { width: 390, height: 844 },
  605 |           ]) {
  606 |             await standalonePage.setViewportSize(size);
  607 |             await standalonePage.goto(previewUrl);
  608 |             await expect(standalonePage).toHaveTitle(finalManifest.name);
  609 |             const teamsLink = standalonePage
  610 |               .locator(
  611 |                 `a[href="#${finalManifest.screens.find((screen) => screen.name === 'Teams')!.id}"]`
  612 |               )
  613 |               .first();
  614 |             await expect(teamsLink).toBeVisible();
  615 |             await teamsLink.click();
  616 |             await expect(standalonePage.locator('.tess-screen')).toHaveAttribute(
  617 |               'data-screen-id',
  618 |               finalManifest.screens.find((screen) => screen.name === 'Teams')!.id
  619 |             );
  620 |             const teamsTable = findManifestNode(
  621 |               finalManifest,
  622 |               'Teams',
  623 |               (node) => node.semanticRole === 'data-table'
  624 |             );
  625 |             await expect(standalonePage.locator(`[data-node-id="${teamsTable.id}"]`)).toBeVisible();
  626 |             const documentWidth = await standalonePage.evaluate(
  627 |               () => document.documentElement.scrollWidth
  628 |             );
  629 |             expect(documentWidth).toBeLessThanOrEqual(size.width);
  630 |             const overviewLink = standalonePage
  631 |               .locator(
  632 |                 `a[href="#${finalManifest.screens.find((screen) => screen.name === 'Team Overview')!.id}"]`
  633 |               )
  634 |               .first();
  635 |             await overviewLink.click();
  636 |             await expect(standalonePage.locator(`[data-node-id="${activity.id}"]`)).toBeVisible();
  637 |             await expect(standalonePage.locator(`[data-node-id="${kpi.id}"]`)).toBeVisible();
  638 |             await expect(
  639 |               standalonePage.locator(
  640 |                 '[data-testid="missing-resource-recovery"], [data-testid="unresolved-required-role-diagnostic"]'
  641 |               )
  642 |             ).toHaveCount(0);
  643 |           }
  644 |         } finally {
  645 |           await standalonePage.close();
  646 |         }
  647 |         expect(standaloneErrors).toEqual([]);
  648 |       } finally {
  649 |         if (previewProcess) {
  650 |           try {
  651 |             if (process.platform === 'win32' && previewProcess.pid)
  652 |               execSync(`taskkill /pid ${previewProcess.pid} /T /F`, { stdio: 'ignore' });
  653 |             else previewProcess.kill('SIGTERM');
  654 |           } catch {
  655 |             /* process may have exited during test cleanup */
  656 |           }
  657 |         }
  658 |         fs.rmSync(tempDir, { recursive: true, force: true });
  659 |       }
  660 |     }
  661 | 
  662 |     fs.writeFileSync(
  663 |       path.join(evidenceDir, `employee-workflow-${viewportLabel}.json`),
  664 |       `${JSON.stringify(
  665 |         {
  666 |           brief: exactBrief,
  667 |           viewport: page.viewportSize(),
  668 |           route: page.url(),
  669 |           projectId: finalManifest.id,
  670 |           selectedDirection: 'C',
  671 |           screens: finalManifest.screens.map((screen) => screen.name),
  672 |           lockedNode: {
  673 |             id: kpi.id,
  674 |             subtreeSha256: lockedHash,
  675 |             resource: finalKpi.resourceRef?.slug,
  676 |           },
  677 |           replacement: { nodeId: activity.id, resource: replacementSlug },
  678 |           undoRedo:
  679 |             'surprise, replacement and recomposition restored exactly through exported manifests',
  680 |           standaloneZip: {
  681 |             filename: zipDownload.suggestedFilename(),
  682 |             files: Object.keys(zipFiles).length,
  683 |             builtAndBrowsed: !isMobile,
  684 |           },
  685 |           screenshot: path.relative(process.cwd(), workbenchScreenshot),
  686 |           consoleErrors,
  687 |           consoleWarnings,
  688 |           uncaughtExceptions,
  689 |           failedRequests,
  690 |           httpErrors,
  691 |         },
  692 |         null,
  693 |         2
  694 |       )}\n`
  695 |     );
> 696 |     expect(consoleErrors).toEqual([]);
      |                           ^ Error: expect(received).toEqual(expected) // deep equality
  697 |     expect(consoleWarnings).toEqual([]);
  698 |     expect(uncaughtExceptions).toEqual([]);
  699 |     expect(failedRequests).toEqual([]);
  700 |     expect(httpErrors).toEqual([]);
  701 |   });
  702 | 
  703 |   // Test 2: Regression Suite — Financial Trading Terminal
  704 |   test('regression suite: financial trading terminal flow with locks, recomposition and zip export', async ({
  705 |     page,
  706 |     isMobile,
  707 |   }) => {
  708 |     test.skip(isMobile, 'Desktop studio workflow targets desktop viewport');
  709 |     const consoleErrors: string[] = [];
  710 |     page.on('console', (msg) => {
  711 |       if (msg.type() === 'error') {
  712 |         const text = msg.text();
  713 |         if (
  714 |           !text.includes('favicon') &&
  715 |           !text.includes('Failed to load resource: the server responded with a status of 404')
  716 |         ) {
  717 |           consoleErrors.push(text);
  718 |         }
  719 |       }
  720 |     });
  721 | 
  722 |     // Step 1: Open /compose
  723 |     await page.goto('/compose');
  724 |     await page.waitForLoadState('domcontentloaded');
  725 | 
  726 |     await expect(
  727 |       page.getByRole('heading', { name: 'Describe the product. Get the interface.' })
  728 |     ).toBeVisible();
  729 | 
  730 |     const catalogStatus = page.locator('[data-testid="catalog-status"]');
  731 |     await expect(catalogStatus).toContainText('Catalogue ready', { timeout: 15000 });
  732 | 
  733 |     const promptText =
  734 |       'A high-density financial intelligence trading terminal with real-time portfolio risk feeds, interactive depth charts, and automated order execution for institutional desks';
  735 |     const descriptionArea = page.locator('textarea#description');
  736 |     await descriptionArea.fill(promptText);
  737 | 
  738 |     const feelInput = page.locator('input#feel');
  739 |     await feelInput.fill('professional but playful');
  740 | 
  741 |     const strikingBtn = page.locator('button:has-text("Striking")').first();
  742 |     if (await strikingBtn.isVisible()) {
  743 |       await strikingBtn.click();
  744 |     }
  745 | 
  746 |     const composeBtn = page.locator('[data-testid="compose-submit-btn"]');
  747 |     await composeBtn.click();
  748 | 
  749 |     await expect(page.locator('text=Inferred Product Architecture').first()).toBeVisible({
  750 |       timeout: 15000,
  751 |     });
  752 | 
  753 |     const dirCard1 = page.locator('[data-testid="direction-card-01"]');
  754 |     const dirCard2 = page.locator('[data-testid="direction-card-02"]');
  755 |     const dirCard3 = page.locator('[data-testid="direction-card-03"]');
  756 | 
  757 |     await expect(dirCard1).toBeVisible();
  758 |     await expect(dirCard2).toBeVisible();
  759 |     await expect(dirCard3).toBeVisible();
  760 | 
  761 |     const preview1 = page.locator('[data-testid="direction-preview-01"]');
  762 |     const preview2 = page.locator('[data-testid="direction-preview-02"]');
  763 |     const preview3 = page.locator('[data-testid="direction-preview-03"]');
  764 |     await expect(preview1).toBeVisible();
  765 |     await expect(preview2).toBeVisible();
  766 |     await expect(preview3).toBeVisible();
  767 | 
  768 |     await assertZeroUnresolvedResources(page, preview1);
  769 |     await assertZeroUnresolvedResources(page, preview2);
  770 |     await assertZeroUnresolvedResources(page, preview3);
  771 | 
  772 |     const openDir3Btn = page.locator('[data-testid="open-workbench-dir-03"]');
  773 |     await openDir3Btn.click();
  774 | 
  775 |     await page.waitForURL(/\/workbench\?project=/, { timeout: 15000 });
  776 |     const topToolbar = page.locator('[data-testid="top-toolbar"]');
  777 |     await expect(topToolbar).toBeVisible({ timeout: 10000 });
  778 | 
  779 |     await assertZeroUnresolvedResources(page);
  780 | 
  781 |     const layersTab = page
  782 |       .locator('aside[data-testid="left-panel"] button:has-text("Layers")')
  783 |       .first();
  784 |     if (await layersTab.isVisible()) {
  785 |       await layersTab.click();
  786 |     }
  787 | 
  788 |     const lockBtn = page.locator('[data-testid^="toggle-lock-"]').nth(1);
  789 |     await expect(lockBtn).toBeVisible({ timeout: 5000 });
  790 |     const lockTestId = await lockBtn.getAttribute('data-testid');
  791 |     expect(lockTestId).toBeTruthy();
  792 |     await lockBtn.click();
  793 | 
  794 |     await expect(lockBtn).toHaveAttribute('title', 'Node Locked');
  795 | 
  796 |     const recomposeBtn = page.locator('[data-testid="recompose-button"]');
```