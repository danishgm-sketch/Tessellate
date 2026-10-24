# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: copy-quality-step-39.spec.ts >> homepage examples disclose sample data and avoid unsupported product metrics
- Location: tests/e2e/copy-quality-step-39.spec.ts:680:1

# Error details

```
Error: page.screenshot: Protocol error (Page.captureScreenshot): Unable to capture screenshot
Call log:
  - taking page screenshot
  - waiting for fonts to load...
  - fonts loaded

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
          - button "Search resources (Press Command-K)" [ref=e15]
          - link "Start building" [ref=e19] [cursor=pointer]:
            - /url: /workbench
          - button "Toggle menu" [ref=e23]
  - main [ref=e25]:
    - generic [ref=e27]:
      - generic [ref=e28]: Open Interface Intelligence
      - generic [ref=e31]:
        - generic [ref=e32]:
          - heading "Describe the product. Get the interface." [level=1] [ref=e33]: Describe the product.Get the interface.
          - paragraph [ref=e34]: Tessellate turns product intent into cohesive interface systems using an open library of components, patterns, motion and design intelligence.
        - generic [ref=e35]:
          - generic [ref=e36]: "Preset Exemplars:"
          - generic "Preset briefs" [ref=e37]:
            - button "AI research terminal" [ref=e38]
            - button "luxury travel marketplace" [ref=e39]
            - button "playful HR platform" [ref=e40]
            - button "developer observability tool" [ref=e41]
            - button "minimalist finance app" [ref=e42]
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]: Product Brief
          - generic [ref=e47]: Deterministic Core Active
        - textbox "Product description and requirements" [ref=e51]:
          - /placeholder: Describe what this product does, its users, complexity, and visual atmosphere…
          - text: An AI market-intelligence platform for procurement teams. Serious and technical in the app, premium and cinematic on marketing pages…
        - generic [ref=e53]:
          - group [ref=e54]:
            - generic "Feel, ambition and structure Professional + Playful · 76 ambition · 64 structure" [ref=e55] [cursor=pointer]:
              - generic [ref=e56]: Feel, ambition and structure
              - generic [ref=e57]: Professional + Playful · 76 ambition · 64 structure
          - button "Compose" [ref=e58] [cursor=pointer]
    - generic [ref=e64]:
      - paragraph [ref=e65]: Three directions, one product
      - heading "Choose a direction. Or blend them." [level=2] [ref=e66]
      - paragraph [ref=e67]: Generate an employee experience example with the real catalogue and composer. Compare its sidebar, editorial and rail workspace structures, then edit the exact project in Workbench.
      - button "Generate example directions" [ref=e68]
      - link "Compose your own brief" [ref=e69] [cursor=pointer]:
        - /url: /compose
    - generic [ref=e71]:
      - generic [ref=e72]:
        - text: The Composition Paradigm
        - heading "Not a component library. A composition system." [level=2] [ref=e73]: Not a component library.A composition system.
        - paragraph [ref=e74]: A resource catalogue gives you reusable building blocks. Tessellate adds a product brief, shared design settings, and a manifest that connects screens, resources, and project intent.
      - generic [ref=e75]:
        - generic [ref=e76]:
          - heading "Starting from a Resource Catalogue" [level=3] [ref=e81]
          - list [ref=e82]:
            - listitem [ref=e83]:
              - generic [ref=e85]:
                - strong [ref=e86]: "Choose resources:"
                - text: The product team decides which components belong on each screen.
            - listitem [ref=e87]:
              - generic [ref=e89]:
                - strong [ref=e90]: "Carry design decisions:"
                - text: Shared tokens and interaction patterns need to stay aligned across resources.
            - listitem [ref=e91]:
              - generic [ref=e93]:
                - strong [ref=e94]: "Connect the screens:"
                - text: The team defines navigation, content, and how interface parts work together.
            - listitem [ref=e95]:
              - generic [ref=e97]:
                - strong [ref=e98]: "Review generated code:"
                - text: Check markup, styles, and behavior in the context of the product.
          - generic [ref=e99]: "Outcome: Resource choice, integration, and consistency remain with the product team."
        - generic [ref=e100]:
          - heading "Tessellate Composition Engine" [level=3] [ref=e104]
          - list [ref=e105]:
            - listitem [ref=e106]:
              - generic [ref=e108]:
                - strong [ref=e109]: "Product model:"
                - text: Interprets a brief into a product domain, audience, and user jobs before planning screens.
            - listitem [ref=e110]:
              - generic [ref=e112]:
                - strong [ref=e113]: "Design DNA:"
                - text: Shared visual settings guide composition and apply to resources that support them.
            - listitem [ref=e114]:
              - generic [ref=e116]:
                - strong [ref=e117]: "Manifest audit:"
                - text: A 100-point rubric scores declared structure and resource metadata; it does not certify the rendered interface.
            - listitem [ref=e118]:
              - generic [ref=e120]:
                - strong [ref=e121]: "Validated mutations:"
                - text: Workbench and integration tools apply typed manifest changes while respecting locked scope.
          - generic [ref=e122]: "Outcome: Export a standalone React + Tailwind project from the manifest you composed and reviewed."
    - generic [ref=e124]:
      - generic [ref=e125]:
        - generic [ref=e126]:
          - text: The Resource Vocabulary
          - heading "Open resources. Clear sample data." [level=2] [ref=e127]
          - paragraph [ref=e128]: Browse React and Tailwind resources with declared provenance, dependency, accessibility, and performance metadata. Example preview · sample data, not live product activity. Runtime eligibility is listed separately from manifest status.
        - generic [ref=e129]:
          - button "All" [pressed] [ref=e130]
          - button "primitive" [ref=e131]
          - button "block" [ref=e132]
          - button "data" [ref=e133]
          - button "AI" [ref=e134]
          - button "shell" [ref=e135]
      - generic [ref=e136]:
        - generic [ref=e137]:
          - generic [ref=e138]:
            - generic [ref=e139]:
              - generic [ref=e141]:
                - generic [ref=e142]: Example series
                - generic [ref=e146]: Sample values
              - generic [ref=e150]: data
            - generic [ref=e151]:
              - heading "Area Chart" [level=3] [ref=e152]
              - paragraph [ref=e153]: Smooth bezier-curved single or dual area plot with subtle vertical gradient fill, baseline threshold, and interactive peek point.
            - generic [ref=e154]:
              - generic [ref=e155]: chart
              - generic [ref=e156]: area
              - generic [ref=e157]: gradient
          - link "Inspect Manifest & Source" [ref=e158] [cursor=pointer]:
            - /url: /r/area-chart
        - generic [ref=e163]:
          - generic [ref=e164]:
            - generic [ref=e165]:
              - generic [ref=e166]:
                - generic [ref=e167]:
                  - generic [ref=e168]: ITEM
                  - generic [ref=e169]: STATUS
                  - generic [ref=e170]: TYPE
                - generic [ref=e171]:
                  - generic [ref=e172]:
                    - generic [ref=e173]: Example A
                    - generic [ref=e174]: READY
                    - generic [ref=e175]: Resource
                  - generic [ref=e176]:
                    - generic [ref=e177]: Example B
                    - generic [ref=e178]: REVIEW
                    - generic [ref=e179]: Pattern
              - generic [ref=e182]: block
            - generic [ref=e183]:
              - heading "Advanced Data Table" [level=3] [ref=e184]
              - paragraph [ref=e185]: Feature-rich data table with column sorting, checkbox selection, pagination, and filter bar.
            - generic [ref=e186]:
              - generic [ref=e187]: table
              - generic [ref=e188]: data-table
              - generic [ref=e189]: sorting
          - link "Inspect Manifest & Source" [ref=e190] [cursor=pointer]:
            - /url: /r/advanced-data-table
        - generic [ref=e195]:
          - generic [ref=e196]:
            - generic [ref=e197]:
              - generic [ref=e198]:
                - generic [ref=e199]: Primary Action
                - generic [ref=e200]: Secondary
              - generic [ref=e201]: primitive
            - generic [ref=e202]:
              - heading "Button" [level=3] [ref=e203]
              - paragraph [ref=e204]: Tactile, accessible multi-intent button primitive with Quiet, Expressive, and Nocturne curated configurations.
            - generic [ref=e205]:
              - generic [ref=e206]: button
              - generic [ref=e207]: action
              - generic [ref=e208]: trigger
          - link "Inspect Manifest & Source" [ref=e209] [cursor=pointer]:
            - /url: /r/button
        - generic [ref=e214]:
          - generic [ref=e215]:
            - generic [ref=e216]:
              - generic [ref=e217]:
                - generic [ref=e218]: Catalogue resources
                - generic [ref=e221]: 324resources
              - generic [ref=e230]: block
            - generic [ref=e231]:
              - heading "Dashboard KPI Grid" [level=3] [ref=e232]
              - paragraph [ref=e233]: Multi-column grid of key performance cards with visual trend indicators and contextual meta.
            - generic [ref=e234]:
              - generic [ref=e235]: dashboard
              - generic [ref=e236]: grid
              - generic [ref=e237]: metrics
          - link "Inspect Manifest & Source" [ref=e238] [cursor=pointer]:
            - /url: /r/dashboard-kpi-grid
        - generic [ref=e243]:
          - generic [ref=e244]:
            - generic [ref=e245]:
              - generic [ref=e246]:
                - generic [ref=e247]: Search commands, workflows…
                - generic [ref=e251]:
                  - generic [ref=e252]: → Recompose screen around locks
                  - generic [ref=e253]: → Review accessibility metadata
              - generic [ref=e254]: ai
            - generic [ref=e255]:
              - heading "AI Prompt Composer" [level=3] [ref=e256]
              - paragraph [ref=e257]: Structured prompt input box with context variable attachment pills, system mode badges, and token counters.
            - generic [ref=e258]:
              - generic [ref=e259]: ai
              - generic [ref=e260]: prompt
              - generic [ref=e261]: composer
          - link "Inspect Manifest & Source" [ref=e262] [cursor=pointer]:
            - /url: /r/ai-prompt-composer
        - generic [ref=e267]:
          - generic [ref=e268]:
            - generic [ref=e269]: shell
            - generic [ref=e280]:
              - heading "Minimal Top Navigation" [level=3] [ref=e281]
              - paragraph [ref=e282]: Restrained horizontal header with brand mark, essential route links, and profile badge.
            - generic [ref=e283]:
              - generic [ref=e284]: header
              - generic [ref=e285]: top-nav
              - generic [ref=e286]: navigation
          - link "Inspect Manifest & Source" [ref=e287] [cursor=pointer]:
            - /url: /r/minimal-top-nav
      - link "Explore All Resources in Catalogue" [ref=e293] [cursor=pointer]:
        - /url: /explore
    - generic [ref=e299]:
      - generic [ref=e300]:
        - text: Visual Spectrum Control
        - heading "Essential → Experimental." [level=2] [ref=e301]
        - paragraph [ref=e302]: Compare restrained, balanced, and expressive treatments using the same resource vocabulary. This illustrative interface is not connected to a live project.
        - generic [ref=e303]:
          - button "01 · Essential" [disabled] [ref=e304]
          - button "02 · Elevated (Default)" [disabled] [pressed] [ref=e305]
          - button "03 · Experimental" [disabled] [ref=e306]
        - status [ref=e307]: Preparing comparison controls…
      - generic [ref=e309]:
        - generic [ref=e310]:
          - generic [ref=e311]:
            - generic [ref=e312]:
              - generic [ref=e313]: T
              - generic [ref=e314]:
                - heading "Tessellate Design Preview" [level=4] [ref=e315]
                - text: Illustrative interface · no project connected
            - generic [ref=e316]:
              - generic [ref=e317]: WCAG 2.2 AA target
              - generic [ref=e318]: Preview only
          - generic [ref=e319]:
            - generic [ref=e320]:
              - generic [ref=e321]: Visual ambition
              - generic [ref=e322]:
                - generic [ref=e323]: 55 / 100
                - generic [ref=e324]: Design DNA setting
            - generic [ref=e325]:
              - generic [ref=e326]: Geometry
              - generic [ref=e327]:
                - generic [ref=e328]: Rounded
                - generic [ref=e329]: Shape treatment
            - generic [ref=e330]:
              - generic [ref=e331]: Motion
              - generic [ref=e332]:
                - generic [ref=e333]: Calm
                - generic [ref=e334]: Example treatment
          - generic [ref=e335]:
            - generic [ref=e336]:
              - generic [ref=e337]: Illustrative layout rhythm
              - generic [ref=e338]: Smoothed Cadence
            - paragraph [ref=e352]: Decorative bars · no usage data
        - generic [ref=e353]:
          - generic [ref=e354]:
            - text: Level 02 · Ambition 45–65
            - heading "Balanced Editorial Elegance" [level=3] [ref=e355]
            - paragraph [ref=e356]: A restrained starting point for product interfaces, with consistent surfaces and a calm typography rhythm.
          - generic [ref=e357]:
            - generic [ref=e358]:
              - generic [ref=e359]: "Visual Ambition:"
              - generic [ref=e360]: "55"
            - generic [ref=e361]:
              - generic [ref=e362]: "Geometry Curvature:"
              - generic [ref=e363]: 8px (Disciplined)
            - generic [ref=e364]:
              - generic [ref=e365]: "Motion Personality:"
              - generic [ref=e366]: soft-ease
    - generic [ref=e368]:
      - generic [ref=e369]:
        - text: Screen Architecture Grammar
        - heading "Familiar → Experimental structure." [level=2] [ref=e370]
        - paragraph [ref=e371]: Tessellate breaks free from the ubiquitous left-sidebar-and-table monoculture when your user workflows demand deeper structural density.
        - paragraph [ref=e372]: Illustrative layout · no connected project. The selectors change this diagram only.
        - generic [ref=e373]:
          - button "Familiar (Standard Sidebar)" [pressed] [ref=e374]
          - button "Modular Cockpit (Three-Pane)" [ref=e375]
          - button "Spatial Canvas (Exploratory)" [ref=e376]
      - generic [ref=e378]:
        - generic [ref=e379]:
          - generic [ref=e380]: "LAYOUT GRAMMAR: STANDARD_SIDEBAR"
          - generic [ref=e385]: DESKTOP WIREFRAME
        - generic [ref=e399]:
          - generic [ref=e400]: "Best for: Executive Dashboards, Settings, Documentation"
          - generic [ref=e401]: Keyboard-accessible selectors
    - generic [ref=e404]:
      - generic [ref=e405]:
        - generic [ref=e406]: Command Studio
        - heading "Step inside the engine. Inspect every design decision." [level=2] [ref=e409]: Step inside the engine.Inspect every design decision.
        - paragraph [ref=e410]: Inspect a project’s structure and Design DNA, make lock-aware changes, and review its manifest checks before exporting.
      - generic [ref=e411]:
        - generic [ref=e412]:
          - generic [ref=e413]:
            - generic [ref=e418]: Tessellate Workbench
            - generic [ref=e419]: Example interface · No project is connected
          - generic [ref=e420]: Illustrative preview
        - generic [ref=e426]:
          - generic [ref=e427]:
            - generic [ref=e428]:
              - generic [ref=e429]: Example canvas · desktop preview
              - generic [ref=e430]: INHERITED PROJECT DNA
            - generic [ref=e431]:
              - generic [ref=e432]:
                - generic [ref=e433]: ACTIVE SCREEN · EXAMPLE
                - generic [ref=e434]: Team overview
              - generic [ref=e435]:
                - generic [ref=e436]: SELECTED NODE · EXAMPLE
                - generic [ref=e437]: Summary
            - generic [ref=e438]: Illustrative canvas · not interactive
          - generic [ref=e439]:
            - generic [ref=e442]: "Example command: recompose around locked items"
            - generic [ref=e443]: not submitted
      - generic [ref=e444]:
        - generic [ref=e445]: Editing works in browser storage after the application and catalogue load. Export a copy for safekeeping.
        - link "Launch Workbench" [ref=e446] [cursor=pointer]:
          - /url: /workbench
    - generic [ref=e451]:
      - generic [ref=e452]:
        - text: Interface Mathematics
        - heading "Compatibility scoring & normalisation." [level=2] [ref=e453]
        - paragraph [ref=e454]: Candidate resources are ranked against their declared metadata, role requirements, dependencies, and the project’s Design DNA. The score helps narrow choices; browser review still matters.
      - generic [ref=e455]:
        - generic [ref=e456]:
          - heading "DNA Distance Vector" [level=3] [ref=e463]
          - paragraph [ref=e464]: Compares normalized project Design DNA with a resource’s declared priors. The resulting fit score is one signal used to rank candidates.
        - generic [ref=e465]:
          - heading "Hard Constraint Gates" [level=3] [ref=e470]
          - paragraph [ref=e471]: Role, variant, and dependency requirements can rule out candidates. Declared accessibility metadata still needs to be checked against the rendered interface.
        - generic [ref=e472]:
          - heading "Responsive Strategies" [level=3] [ref=e478]
          - paragraph [ref=e479]: Resources declare responsive approaches. Review Workbench and exported previews at the widths your product needs; layout is not automatically substituted for you.
    - generic [ref=e482]:
      - generic [ref=e483]:
        - generic [ref=e484]: Agent-Native Architecture
        - heading "Built for autonomous agents and humans alike." [level=2] [ref=e489]
        - paragraph [ref=e490]: Coding agents and people can inspect the same project manifest and use the same typed mutation contracts to change an interface.
        - list [ref=e491]:
          - listitem [ref=e492]:
            - generic [ref=e496]:
              - strong [ref=e497]: "Project manifests:"
              - text: Export a composed project as a schema-validated
              - code [ref=e498]: .tess.json
              - text: file.
          - listitem [ref=e499]:
            - generic [ref=e503]:
              - strong [ref=e504]: "Structured mutations:"
              - text: Typed operations can update project structure and provide inverse changes for undo.
          - listitem [ref=e505]:
            - generic [ref=e509]:
              - strong [ref=e510]: "Registered resources:"
              - text: Composition selects from the resource registry; unsupported roles remain visible for review.
          - listitem [ref=e511]:
            - generic [ref=e515]:
              - strong [ref=e516]: "Agent handoff:"
              - text: Exports the project brief, design, implementation, components, dependencies, and an agent prompt.
      - generic [ref=e517]:
        - generic [ref=e518]:
          - generic [ref=e519]: ProjectManifest excerpt
          - generic [ref=e523]: ILLUSTRATIVE EXCERPT
        - generic "AGENT_HANDOFF JSON specification" [ref=e524]: "{ \"schemaVersion\": \"1.0.0\", \"name\": \"Employee experience\", \"productModel\": { \"productArchetypes\": [ { \"tag\": \"recruitment\", \"weight\": 100 } ] }, \"designDNA\": { \"professionalism\": 80, \"playfulness\": 55, \"visualAmbition\": 40, \"structuralCreativity\": 85 }, \"screens\": [ { \"name\": \"Team Overview\", \"slug\": \"/overview\" } ] }}"
        - generic [ref=e525]:
          - generic [ref=e526]: Example fields · complete contracts in Docs
          - generic [ref=e527]: v0.1.0
    - generic [ref=e530]:
      - generic [ref=e531]:
        - generic [ref=e532]: Public Commons
        - heading "100% Free. No Pro component gates. No download caps." [level=3] [ref=e539]
        - paragraph [ref=e540]: Interface building blocks belong in the public commons. Tessellate will never lock high-value tables or charts behind a paywalled subscription. The entire component and pattern vocabulary is freely accessible to developers and autonomous agents forever.
        - generic [ref=e541]:
          - generic [ref=e542]: MIT / Apache 2.0
          - generic [ref=e543]: Zero Telemetry Tracking
          - generic [ref=e544]: Copy & Paste or Download ZIP
      - generic [ref=e545]:
        - generic [ref=e546]: Creator Ecosystem
        - heading "Publish resources with a declared contract." [level=3] [ref=e550]
        - paragraph [ref=e551]: Resource manifests can describe variants, slots, dependencies, and Design DNA priors. This helps compatible React tools inspect a resource before integration; each target application still needs its own review.
        - link "Learn how to author & submit a manifest" [ref=e553] [cursor=pointer]:
          - /url: /creators
    - generic [ref=e558]:
      - generic [ref=e559]:
        - text: Quality & Security Invariants
        - heading "Inspectable quality. Verify in the browser." [level=2] [ref=e560]: Inspectable quality.Verify in the browser.
        - paragraph [ref=e561]: The deterministic audit inspects manifest and declared resource metadata. Browser accessibility, visual behaviour and export builds require runtime verification.
      - generic [ref=e562]:
        - generic [ref=e563]:
          - generic [ref=e564]:
            - heading "Manifest Audit Rubric" [level=3] [ref=e569]
            - generic [ref=e570]: "Rubric: 100 points total"
          - generic [ref=e571]:
            - generic [ref=e572]:
              - generic [ref=e573]:
                - generic [ref=e574]: Cohesion
                - generic [ref=e575]: 20 pts
              - paragraph [ref=e576]: Palette, curvature, and typography alignment
            - generic [ref=e577]:
              - generic [ref=e578]:
                - generic [ref=e579]: Accessibility
                - generic [ref=e580]: 20 pts
              - paragraph [ref=e581]: Declared accessibility metadata and semantic roles
            - generic [ref=e582]:
              - generic [ref=e583]:
                - generic [ref=e584]: Performance
                - generic [ref=e585]: 15 pts
              - paragraph [ref=e586]: Bundle size, dependencies, and runtime complexity
            - generic [ref=e587]:
              - generic [ref=e588]:
                - generic [ref=e589]: Responsive Layout
                - generic [ref=e590]: 15 pts
              - paragraph [ref=e591]: Ergonomic scaling across mobile, tablet & desktop
            - generic [ref=e592]:
              - generic [ref=e593]:
                - generic [ref=e594]: Visual Hierarchy
                - generic [ref=e595]: 10 pts
              - paragraph [ref=e596]: Clear focal headers & structural navigation
            - generic [ref=e597]:
              - generic [ref=e598]:
                - generic [ref=e599]: Density Consistency
                - generic [ref=e600]: 5 pts
              - paragraph [ref=e601]: Controlled spacing variance between cards
            - generic [ref=e602]:
              - generic [ref=e603]:
                - generic [ref=e604]: Motion Consistency
                - generic [ref=e605]: 5 pts
              - paragraph [ref=e606]: Cadence alignment & reduced-motion safety
            - generic [ref=e607]:
              - generic [ref=e608]:
                - generic [ref=e609]: Design Compliance
                - generic [ref=e610]: 5 pts
              - paragraph [ref=e611]: Declared design constraints and compatibility
            - generic [ref=e612]:
              - generic [ref=e613]:
                - generic [ref=e614]: Interaction Harmony
                - generic [ref=e615]: 5 pts
              - paragraph [ref=e616]: Clear single primary button actions per panel
        - generic [ref=e617]:
          - heading "Build and Runtime Budgets" [level=4] [ref=e621]
          - list [ref=e622]:
            - listitem [ref=e623]:
              - generic [ref=e626]:
                - strong [ref=e627]: "Zero Runtime Lock-In:"
                - text: Exported code is vanilla React 19 + Tailwind CSS 4. No Tessellate SDK required in production.
            - listitem [ref=e628]:
              - generic [ref=e631]:
                - strong [ref=e632]: "Reduced-Motion First Class:"
                - text: Smooth degradation to static fades when the user prefers reduced motion.
            - listitem [ref=e633]:
              - generic [ref=e636]:
                - strong [ref=e637]: "Homepage script budget:"
                - text: Initial JavaScript is checked against a 150 KB gzip target. Load time depends on the device and connection.
          - generic [ref=e638]: WCAG 2.2 AA is a target. A metadata score does not certify accessibility; test the rendered project.
    - generic [ref=e640]:
      - generic [ref=e641]:
        - generic [ref=e642]:
          - heading "Start with a product brief." [level=2] [ref=e643]
          - paragraph [ref=e644]: No credit card. No account required. Runs locally in your browser.
        - generic [ref=e645]:
          - textbox "Product brief" [ref=e646]:
            - /placeholder: Type your product concept (e.g. Developer security terminal)…
          - button "Launch Engine" [ref=e647]
      - generic [ref=e651]:
        - generic [ref=e652]:
          - generic [ref=e653]:
            - generic [ref=e654]: Tessellate
            - paragraph [ref=e661]: Open interface intelligence and deterministic UI composition platform for humans and autonomous coding agents.
            - generic [ref=e662]: MIT / Apache 2.0 Open Source
          - generic [ref=e663]:
            - text: Product
            - list [ref=e664]:
              - listitem [ref=e665]:
                - link "Explore Catalogue" [ref=e666] [cursor=pointer]:
                  - /url: /explore
              - listitem [ref=e667]:
                - link "Product Composer" [ref=e668] [cursor=pointer]:
                  - /url: /compose
              - listitem [ref=e669]:
                - link "Workbench Studio" [ref=e670] [cursor=pointer]:
                  - /url: /workbench
              - listitem [ref=e671]:
                - link "Ten Launch Tools" [ref=e672] [cursor=pointer]:
                  - /url: /tools
          - generic [ref=e673]:
            - text: Architecture
            - list [ref=e674]:
              - listitem [ref=e675]:
                - link "Agent Integration" [ref=e676] [cursor=pointer]:
                  - /url: /agents
              - listitem [ref=e677]:
                - link "Design DNA Contract" [ref=e678] [cursor=pointer]:
                  - /url: /docs
              - listitem [ref=e679]:
                - link "Manifest audit rubric" [ref=e680] [cursor=pointer]:
                  - /url: /docs
              - listitem [ref=e681]:
                - link "Structured Mutations" [ref=e682] [cursor=pointer]:
                  - /url: /docs
          - generic [ref=e683]:
            - text: Ecosystem
            - list [ref=e684]:
              - listitem [ref=e685]:
                - link "Creator Commons" [ref=e686] [cursor=pointer]:
                  - /url: /creators
              - listitem [ref=e687]:
                - link "GitHub" [ref=e688] [cursor=pointer]:
                  - /url: https://github.com/danishgm-sketch/Tessellate
              - listitem [ref=e693]:
                - link "Documentation" [ref=e694] [cursor=pointer]:
                  - /url: /docs
              - listitem [ref=e695]:
                - link "Local Offline Mode" [ref=e696] [cursor=pointer]:
                  - /url: /workbench
        - generic [ref=e697]:
          - generic [ref=e698]: © 2026 Tessellate. Free open interface commons.
          - generic [ref=e699]: Deterministic composition · v0.1.0
```

# Test source

```ts
  628 |     uncaughtExceptions: [] as string[],
  629 |     failedRequests: [] as Array<{ url: string; error: string | null }>,
  630 |     httpErrors: [] as Array<{ url: string; status: number }>,
  631 |   };
  632 |   page.on('console', (message) => {
  633 |     if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  634 |   });
  635 |   page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  636 |   page.on('requestfailed', (request) =>
  637 |     runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  638 |   );
  639 |   page.on('response', (response) => {
  640 |     if (response.status() >= 400)
  641 |       runtime.httpErrors.push({ url: response.url(), status: response.status() });
  642 |   });
  643 |
  644 |   await page.goto('/r/cta-product-preview');
  645 |   await expect(page.getByRole('heading', { name: 'CTA Product Preview' })).toBeVisible();
  646 |   const preview = page.frameLocator('iframe[title="CTA Product Preview live preview"]');
  647 |   await expect(preview.locator('body')).toHaveText(/\S/);
  648 |
  649 |   const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  650 |   const beforeScreenshot = path.resolve(
  651 |     process.cwd(),
  652 |     `quality/evidence/step-39/before/${viewport}/cta-product-preview-inert-action.png`
  653 |   );
  654 |   await mkdir(path.dirname(beforeScreenshot), { recursive: true });
  655 |   await page.screenshot({ path: beforeScreenshot, fullPage: true });
  656 |
  657 |   const composeLink = preview.getByRole('link', { name: 'Start composing' });
  658 |   await expect(composeLink).toHaveAttribute('href', '/compose');
  659 |   await expect(preview.getByRole('button', { name: 'Open Canvas Now' })).toHaveCount(0);
  660 |   const visibleText = await preview.locator('body').innerText();
  661 |   expect(visibleText).not.toMatch(/Join thousands|324 Verified Manifests Ready|Canvas Active/i);
  662 |   expect(runtime.consoleErrors).toEqual([]);
  663 |   expect(runtime.uncaughtExceptions).toEqual([]);
  664 |   expect(runtime.failedRequests).toEqual([]);
  665 |   expect(runtime.httpErrors).toEqual([]);
  666 |
  667 |   const afterScreenshot = path.resolve(
  668 |     process.cwd(),
  669 |     `quality/evidence/step-39/after/${viewport}/cta-product-preview.png`
  670 |   );
  671 |   await mkdir(path.dirname(afterScreenshot), { recursive: true });
  672 |   await page.screenshot({ path: afterScreenshot, fullPage: true });
  673 |   await writeFile(
  674 |     afterScreenshot.replace(/\.png$/, '.json'),
  675 |     `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), visibleText, runtime }, null, 2)}\n`,
  676 |     'utf8'
  677 |   );
  678 | });
  679 |
  680 | test('homepage examples disclose sample data and avoid unsupported product metrics', async ({
  681 |   page,
  682 | }, testInfo) => {
  683 |   const runtime = {
  684 |     consoleErrors: [] as string[],
  685 |     uncaughtExceptions: [] as string[],
  686 |     failedRequests: [] as Array<{ url: string; error: string | null }>,
  687 |     httpErrors: [] as Array<{ url: string; status: number }>,
  688 |   };
  689 |   page.on('console', (message) => {
  690 |     if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  691 |   });
  692 |   page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  693 |   page.on('requestfailed', (request) =>
  694 |     runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  695 |   );
  696 |   page.on('response', (response) => {
  697 |     if (response.status() >= 400)
  698 |       runtime.httpErrors.push({ url: response.url(), status: response.status() });
  699 |   });
  700 |
  701 |   await page.goto('/');
  702 |   const pageText = await page.locator('main').innerText();
  703 |   expect(pageText).not.toMatch(
  704 |     /£14,250\.00|£3,890\.50|£142,500|£4\.28M|18,400|99\.98%|1,492|TPS Telemetry|Gross Volume|Settlement|Join thousands of developers|Workbench Canvas Active|100% Keyboard Navigable|initial paint instantaneous/i
  705 |   );
  706 |   expect(pageText).not.toMatch(
  707 |     /zero-debt|fully accessible|complete design cohesion|zero hallucinations|compatible with every system|instantly integrate|without CSS conflicts|automatically substitutes|WCAG AA\/AAA|Every combination is scored|Start composing in seconds|full deterministic operating environment|mix adjective feels|AGENT_HANDOFF\.md|all components dynamically inherit/i
  708 |   );
  709 |   expect(pageText).toContain('Example preview · sample data');
  710 |   expect(pageText).toContain('No project is connected');
  711 |   expect(pageText).toContain('WCAG 2.2 AA target');
  712 |   expect(pageText).toContain(
  713 |     'A 100-point rubric scores declared structure and resource metadata; it does not certify the rendered interface.'
  714 |   );
  715 |   expect(pageText).toContain('layout is not automatically substituted for you.');
  716 |   expect(pageText).toContain('Agent handoff');
  717 |   expect(runtime.consoleErrors).toEqual([]);
  718 |   expect(runtime.uncaughtExceptions).toEqual([]);
  719 |   expect(runtime.failedRequests).toEqual([]);
  720 |   expect(runtime.httpErrors).toEqual([]);
  721 |
  722 |   const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  723 |   const screenshot = path.resolve(
  724 |     process.cwd(),
  725 |     `quality/evidence/step-39/after/${viewport}/homepage-copy-truth.png`
  726 |   );
  727 |   await mkdir(path.dirname(screenshot), { recursive: true });
> 728 |   await page.screenshot({ path: screenshot, fullPage: true });
      |              ^ Error: page.screenshot: Protocol error (Page.captureScreenshot): Unable to capture screenshot
  729 |   await writeFile(
  730 |     screenshot.replace(/\.png$/, '.json'),
  731 |     `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), mainText: pageText, runtime }, null, 2)}\n`,
  732 |     'utf8'
  733 |   );
  734 |
  735 |   for (const capture of [
  736 |     { heading: 'Open resources. Clear sample data.', name: 'homepage-resource-mosaic' },
  737 |     { heading: 'Essential → Experimental.', name: 'homepage-design-spectrum' },
  738 |     { heading: /Step inside the engine/, name: 'homepage-workbench-example' },
  739 |   ]) {
  740 |     await page.getByRole('heading', { name: capture.heading }).scrollIntoViewIfNeeded();
  741 |     await page.screenshot({
  742 |       path: path.resolve(
  743 |         process.cwd(),
  744 |         `quality/evidence/step-39/after/${viewport}/${capture.name}.png`
  745 |       ),
  746 |     });
  747 |   }
  748 |
  749 |   await page.getByRole('heading', { name: /Step inside the engine/ }).scrollIntoViewIfNeeded();
  750 |   const chrome = page.getByTestId('home-workbench-chrome');
  751 |   const title = chrome.getByText('Tessellate Workbench', { exact: true });
  752 |   const status = chrome.getByText('Example interface · No project is connected', { exact: true });
  753 |   await expect(title).toBeVisible();
  754 |   await expect(status).toBeVisible();
  755 |   const chromeScreenshot = path.resolve(
  756 |     process.cwd(),
  757 |     `quality/evidence/step-39/after/${viewport}/homepage-workbench-example.png`
  758 |   );
  759 |   await page.screenshot({ path: chromeScreenshot });
  760 |   const geometry = await Promise.all(
  761 |     [title, status].map(async (locator) => {
  762 |       const box = await locator.boundingBox();
  763 |       return box && { x: box.x, y: box.y, width: box.width, height: box.height };
  764 |     })
  765 |   );
  766 |   const overlap = Boolean(
  767 |     geometry[0] &&
  768 |     geometry[1] &&
  769 |     geometry[0].x < geometry[1].x + geometry[1].width &&
  770 |     geometry[0].x + geometry[0].width > geometry[1].x &&
  771 |     geometry[0].y < geometry[1].y + geometry[1].height &&
  772 |     geometry[0].y + geometry[0].height > geometry[1].y
  773 |   );
  774 |   await writeFile(
  775 |     chromeScreenshot.replace(/\.png$/, '.json'),
  776 |     `${JSON.stringify({ route: page.url(), viewport: page.viewportSize(), title: geometry[0], status: geometry[1], overlap, runtime }, null, 2)}\n`,
  777 |     'utf8'
  778 |   );
  779 |   expect(overlap).toBe(false);
  780 | });
  781 |
  782 | test('homepage spectrum controls explain their pre-hydration state', async ({ browser }) => {
  783 |   const page = await browser.newPage({
  784 |     javaScriptEnabled: false,
  785 |     viewport: { width: 1440, height: 900 },
  786 |   });
  787 |   const runtime = watchRuntime(page);
  788 |   const response = await page.goto('/');
  789 |   expect(response?.status()).toBe(200);
  790 |   await page.getByRole('heading', { name: 'Essential → Experimental.' }).scrollIntoViewIfNeeded();
  791 |   const essentialButton = page.getByRole('button', { name: /01 · Essential/ });
  792 |   const evidencePhase = (await essentialButton.isDisabled()) ? 'after' : 'before';
  793 |   const evidenceDirectory = path.resolve(process.cwd(), `quality/evidence/step-39/${evidencePhase}`);
  794 |   const screenshot = path.resolve(
  795 |     evidenceDirectory,
  796 |     'desktop/homepage-spectrum-controls-before-hydration.png'
  797 |   );
  798 |   await mkdir(path.dirname(screenshot), { recursive: true });
  799 |   await page.screenshot({ path: screenshot, fullPage: true });
  800 |   const beforeHydration = {
  801 |     capturedAt: new Date().toISOString(),
  802 |     route: page.url(),
  803 |     viewport: page.viewportSize(),
  804 |     status: response?.status(),
  805 |     buttonDisabled: await essentialButton.isDisabled(),
  806 |     statusText: await page.getByRole('status').allTextContents(),
  807 |     runtime,
  808 |     screenshot,
  809 |   };
  810 |   await writeFile(
  811 |     path.resolve(evidenceDirectory, 'desktop/homepage-spectrum-controls-before-hydration.json'),
  812 |     `${JSON.stringify(beforeHydration, null, 2)}\n`
  813 |   );
  814 |   await expect(essentialButton).toBeDisabled();
  815 |   await expect(page.locator('#visual-spectrum-controls-status')).toContainText(
  816 |     'Preparing comparison controls'
  817 |   );
  818 |   await page.close();
  819 | });
  820 |
  821 | test('homepage resource examples use catalogue identities and demo controls have truthful behavior', async ({
  822 |   page,
  823 | }, testInfo) => {
  824 |   const runtime = {
  825 |     consoleErrors: [] as string[],
  826 |     uncaughtExceptions: [] as string[],
  827 |     failedRequests: [] as Array<{ url: string; error: string | null }>,
  828 |     httpErrors: [] as Array<{ url: string; status: number }>,
```
