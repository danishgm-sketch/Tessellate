# Tessellate MCP

The MCP package exposes Tessellate's existing catalogue, composition pipeline,
manifest validation, mutation and source-tree export to local agent clients. It
is a private workspace package; this repository does not publish an independently
installable MCP distribution.

## Run the stdio server from a repository checkout

Start the server with the repository root as its working directory:

```sh
node --import tsx/esm packages/mcp/src/index.ts
```

An MCP client should start that process and communicate over stdin/stdout. The
server writes diagnostics to stderr; stdout is reserved for the MCP protocol.
The local catalogue is schema-validated before use. If the checkout has no local
catalogue, the server may load the published static catalogue with a five-second
timeout. A malformed local catalogue is reported as an error instead of being
replaced with an empty catalogue. Resource source retrieval reads the matching
source file from the checkout; a missing file is returned as a tool error with a
registry URL for follow-up.

## Tools

The server registers these 15 tools: `search_resources`, `get_resource`,
`get_resource_code`, `get_resource_metadata`, `find_alternatives`,
`recommend_resources`, `compose_screen`, `compose_product`, `validate_project`,
`audit_project`, `get_design_dna`, `list_design_directions`,
`export_project_code`, `audit_project_accessibility`, and `mutate_screen_ast`.

`compose_screen` and `compose_product` accept the same audience, feel, ambition,
structure, device, accessibility, performance and screen-constraint controls as
the shared composer. `compose_screen` accepts a seed so an agent can reproduce
the same direction as another caller. A composition with unresolved required
roles fails with an MCP tool error and does not return an incomplete project.

Tool errors set the MCP `isError` result flag. `find_alternatives` returns
same-type, shared-category candidates and explains its ranking basis; it does not
claim that these resources are guaranteed drop-in replacements. Recommendations
use lexical token overlap.

`audit_project` and `audit_project_accessibility` are manifest heuristics. They
do not inspect rendered pages and cannot certify WCAG conformance, actual color
contrast, keyboard behavior, screen-reader output, reduced-motion behavior, or
runtime performance. Their responses list what remains unassessed.
`export_project_code` returns generated files; it does not install dependencies,
build or run the exported application. These limits are reflected in tool
descriptions and results.

## HTTP/SSE compatibility endpoint

`startMcpSseServer` is an optional local compatibility helper. It binds to
`127.0.0.1` by default and rejects non-loopback bind addresses. It supports
multiple independent MCP sessions, rejects every browser request whose origin
is absent from the exact `allowedOrigins` list, and does not send wildcard CORS
headers. The transport has no authentication and is not a remote MCP transport;
it remains Beta pending authenticated remote transport and broader operational
testing.

## Verification

The Vitest MCP suite starts the stdio server as a child process and uses the
official MCP `Client` and `StdioClientTransport`. It enumerates and calls all 15
tools through the protocol, runs the employee-experience compose/mutate/validate/
audit/export flow, checks same-seed composition against the shared engine, and
checks local SSE with two clients. Catalogue tests cover per-checkout cache
isolation and malformed local files. See
[`quality/STEP_27_EVIDENCE.md`](../../quality/STEP_27_EVIDENCE.md).
