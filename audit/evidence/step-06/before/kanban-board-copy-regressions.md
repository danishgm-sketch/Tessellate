# Kanban copy regressions (before fix)

Both failures were reproduced through the Sites Worker browser preview at 360x844 using the Gold state certification test.

1. Empty-state guidance
   - Expected: `This board has no columns or tasks.`
   - Actual: `No tasks yet. Add a column or task to get started.`
   - The empty component exposes no button to add either item.
   - Test assertion: `gold-resource-state-certification.spec.ts` empty board state.

2. Unsupported sample metrics
   - Expected: representative task text without invented catalogue totals.
   - Actual: `Scale 56 application blocks`, `72 Marketing sections verified`, and `44 Primitives complete`.
   - Test assertion failed because `Scale 56 application blocks` was visible in the default resource preview.
   - Before capture: `audit/evidence/step-06/before/state-captures/kanban-board-fake-counts-360.png`.

The original failing Playwright run's test output showed the received status text and the visible fabricated task. The test was run before the source copy fix.
