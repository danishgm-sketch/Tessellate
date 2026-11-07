# AUD-114 pre-fix reproduction record

- Route: `/compose`
- Viewport: 1440 × 900
- Brief: ECOM-06, the online returns portal benchmark brief
- Screen: Direction C, Return Request
- Control: disabled `Submit return request` button
- Expected title: `Connect a returns service before submitting requests.`
- Observed before the fix: `Connect the exported application to your backend to enable this action.`
- Reproduction: compose ECOM-06, open Direction C's full preview, select Return Request, and inspect the disabled button's title.
- Regression: the semantic and visible browser assertions now require the returns-specific title. The initial browser assertion reported the generic backend title; the corrected local regression passes at desktop and mobile viewports.
- Capture note: the first pass recorded the incorrect title from the live control but did not preserve a screenshot of the hover tooltip. The after captures and machine-readable runtime reports are recorded separately.
