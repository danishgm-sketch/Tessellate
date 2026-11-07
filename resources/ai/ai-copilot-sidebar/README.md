# AI Copilot Sidebar

Example copilot sidebar showing sample file context and proposed fixes. It does not inspect source files, call a model, or apply patches in the preview. A host may provide its own integration and pass an `onApplyRecommendedFixes` callback after validating the proposed changes; without that callback, the Apply button is disabled.
