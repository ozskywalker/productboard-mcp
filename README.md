# Productboard MCP Server

Integrate the Productboard API into agentic workflows via MCP

This server wraps [Productboard's Public API v2](https://developer.productboard.com/reference/introduction) the way an LLM actually calls tools, not the way a REST client does:

- **Pagination cursors don't have to be exact.** Productboard's own docs tell you to copy the cursor "from `links.next`" — but `links.next` is a full URL, not a bare token. `pageCursor` here accepts either, so the obvious thing to do is also the correct thing to do.
- **Sparse fieldsets.** Every list and detail tool takes an optional `fields` array (e.g. `["name", "status"]`). A caller that wants three fields off a feature isn't forced to pull the full payload — features in particular carry a nested `relationships` block most callers don't need, and that adds up fast in an LLM's context window.
- **No N+1 traps.** `get_initiative_features` can `expand` its link stubs into full feature detail in one call, instead of making you loop `get_feature_detail` per ID. Expansion runs with bounded concurrency to respect Productboard's rate limit, and a feature that fails to resolve comes back as `{ id, type, error }` rather than failing the whole batch.
- **Marked safe to call.** Every tool tells the client up front that it's read-only, so nothing here should trigger the "this might do something risky" confirmation some clients show before running a tool.
- **Failures are flagged as failures.** A failed call comes back tagged as an error, not as a normal-looking response with an error message the caller has to notice on their own.
- **Hiccups are handled for you.** A brief rate limit or server error from Productboard is retried automatically, instead of surfacing as a failure the calling model has to notice and retry itself.
- **Structured, not just text.** Responses come back in a structured form alongside the usual text, which suits clients — including OpenAI-based ones — that consume tool output programmatically rather than by re-parsing text.

It's also strictly read-only — 16 tools, all GET, no write or delete surface at all — and already migrated to API v2; v1 was sunset 2026-07-08.

## Tools

| Tool | Description |
|---|---|
| `get_companies` | List all companies (cursor-paginated) |
| `get_company_detail` | Get a specific company by ID |
| `get_components` | List all components (cursor-paginated) |
| `get_component_detail` | Get a specific component by ID |
| `get_features` | List all features (cursor-paginated) |
| `get_feature_detail` | Get a specific feature by ID |
| `get_feature_statuses` | List all feature statuses |
| `get_notes` | List all notes (cursor-paginated) |
| `get_note_detail` | Get a specific note by ID |
| `get_products` | List all products (cursor-paginated) |
| `get_product_detail` | Get a specific product by ID |
| `get_initiatives` | List all initiatives (cursor-paginated) |
| `get_initiative_detail` | Get a specific initiative by ID |
| `get_initiative_features` | List features linked to an initiative (cursor-paginated, optionally `expand`ed into full feature detail) |
| `get_objectives` | List all objectives (cursor-paginated) |
| `get_objective_detail` | Get a specific objective by ID |

### Migrating from v1

- `get_companies`, `get_components`, `get_features`, `get_products`, `get_initiatives`, and `get_objectives` all moved onto v2's unified `/entities` resource internally — the tool names and shapes didn't change, but there's no `page` parameter anymore (see cursor pagination above).
- `get_initiative_features` returns link stubs (`id`/`type`/`links`) by default, since v2's relationship endpoint doesn't expand targets on its own — pass `expand: true` to get full feature objects instead (see above).
- `get_notes` filtering is narrower in v2: the v1 `term` (full-text search), `featureId`, `companyId`, `anyTag`/`allTags`, and `last` filters have no v2 equivalent and are no longer supported.


## Setup

### Access Token
Obtain your access token referring to [this guidance](https://developer.productboard.com/reference/authentication#public-api-access-token)

### Build

This server is run locally from source — it is not published to the npm registry, so `npx productboard-mcp` will not work. Clone the repository and build it first:

```bash
git clone https://github.com/kenjihikmatullah/productboard-mcp
cd productboard-mcp
npm install
```

This compiles TypeScript to `build/index.js`.

### Usage with Claude Desktop
To use this with Claude Desktop, add the following to your `claude_desktop_config.json`, pointing `args` at the absolute path to `build/index.js` in your local checkout:

```json
{
  "mcpServers": {
    "productboard": {
      "command": "node",
      "args": [
        "/absolute/path/to/productboard-mcp/build/index.js"
      ],
      "env": {
        "PRODUCTBOARD_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
