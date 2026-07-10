# Productboard MCP Server

Integrate the Productboard API into agentic workflows via MCP

This server uses [Productboard's Public API v2](https://developer.productboard.com/reference/introduction). v1 was sunset on 2026-07-08.

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
| `get_initiative_features` | List features linked to an initiative (cursor-paginated) |
| `get_objectives` | List all objectives (cursor-paginated) |
| `get_objective_detail` | Get a specific objective by ID |

### Notes on the v1 → v2 migration

- **Pagination is cursor-based**, not page-number based. Pass the `pageCursor` from a response's `links.next` to fetch the next page — there's no `page` parameter anymore. `pageCursor` accepts either the bare cursor token or the full `links.next` URL.
- **Sparse fieldsets**: list and detail tools accept an optional `fields` array (e.g. `["name", "status"]`, or `["all"]` for everything) to trim large entity payloads — features in particular carry a nested `relationships` block that most callers don't need.
- **`get_initiative_features`** returns link stubs (`id`/`type`/`links`) rather than full feature objects, since v2's relationship endpoint doesn't expand targets. Follow up with `get_feature_detail` per ID for full data.
- **`get_notes`** filtering is narrower in v2: the v1 `term` (full-text search), `featureId`, `companyId`, `anyTag`/`allTags`, and `last` filters have no v2 equivalent and are no longer supported.


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
