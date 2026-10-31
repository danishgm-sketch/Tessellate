# Step 18 failing browser evidence

The project-scope UI regression failed before the fix at
`tests/e2e/workbench-inheritance-hardening.spec.ts`: after selecting **Deselect
Node**, the visible Feel Mixer value was still labelled `inherited`; the expected
source label `Project` did not exist. The failing browser screenshot is
`project-scope-reported-as-inherited.png`.

The first lock journey expected a locked child to start inheriting the changed
parent immediately after unlock. The browser instead showed its frozen value as
an explicit override and exposed **Reset to Inherited**. Inspection of the
visible Locks panel and manifest state established that this is the intended
snapshot behavior; the missing part was an explanation. The final regression
now checks the documented states in order: inherited → locked/frozen → local
override after unlock → inherited after explicit reset. The before screenshot is
`unlock-snapshots-as-overrides.png`.
