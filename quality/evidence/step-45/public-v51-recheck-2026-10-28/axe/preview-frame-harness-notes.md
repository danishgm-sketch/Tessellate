The first v51 mobile Gold-resource sweep did not reach its Axe assertions. Its
test queried `[data-node-id="preview-<slug>"]` and then a heading on the outer
page. Sites serves the isolated resource document inside a child iframe; the
renderer does not promise that `data-node-id` attribute, and the preview heading
is inside the child frame. The failure screenshot showed the requested resource
content, so this was a test harness error rather than a missing product render.

The test now finds the actual preview frame and waits for its resource heading.
The repeated public mobile run passed Axe on all 40 Gold resources in the
expressive dark variant with zero findings. Report:
`mobile-gold-resources-dark-expressive.json`.
