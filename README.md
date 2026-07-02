# Productboard MCP Server

Integrate the Productboard API into agentic workflows via MCP


## Tools

| Tool | Description |
|---|---|
| `get_companies` | List all companies (paginated) |
| `get_company_detail` | Get a specific company by ID |
| `get_components` | List all components (paginated) |
| `get_component_detail` | Get a specific component by ID |
| `get_features` | List all features (paginated) |
| `get_feature_detail` | Get a specific feature by ID |
| `get_feature_statuses` | List all feature statuses |
| `get_notes` | List all notes (paginated) |
| `get_note_detail` | Get a specific note by ID |
| `get_products` | List all products (paginated) |
| `get_product_detail` | Get a specific product by ID |
| `get_initiatives` | List all initiatives (paginated) |
| `get_initiative_detail` | Get a specific initiative by ID |
| `get_initiative_features` | List features linked to an initiative (paginated) |
| `get_objectives` | List all objectives (paginated) |
| `get_objective_detail` | Get a specific objective by ID |


## Setup

### Access Token
Obtain your access token referring to [this guidance](https://developer.productboard.com/reference/authentication#public-api-access-token)

### Usage with Claude Desktop
To use this with Claude Desktop, add the following to your `claude_desktop_config.json`:

### NPX

```json
{
  "mcpServers": {
    "productboard": {
      "command": "npx",
      "args": [
        "-y",
        "productboard-mcp"
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