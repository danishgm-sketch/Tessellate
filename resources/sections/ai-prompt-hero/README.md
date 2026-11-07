# AI Prompt Hero

A responsive prompt-input section with local example prompts. It does not include an AI model, send network requests, or generate a blueprint.

Pass an optional `onGenerate(prompt)` callback to connect the button to a host application's existing workflow. Without that callback, the button stays disabled and the prompt remains in the component's page state. The textarea has an accessible name, and the helper text explains what happens to the prompt.
