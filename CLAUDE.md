# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that integrates the Productboard API into agentic workflows. The server exposes 16 read-only tools for accessing Productboard entities through a standardized MCP interface.

## Common Commands

### Building and Development
- `npm run build` - Compiles TypeScript to JavaScript and makes the output executable
- `npm run watch` - Watches TypeScript files for changes and recompiles automatically
- `npm run prepare` - Runs build (used for npm publishing)
- `npm test` - Runs the test suite (Vitest)
- `npx @modelcontextprotocol/inspector build/index.js` - Launches MCP inspector for testing tools

### Environment Setup
The server requires `PRODUCTBOARD_ACCESS_TOKEN` environment variable to be set. Without this token, the server will exit with an error on startup.

## Architecture

### Core Structure
- **Entry Point**: `src/index.ts` - Main MCP server setup and tool routing
- **HTTP Client**: `src/productboard_client.ts` - Singleton client for Productboard API calls
- **Tool Modules**: Organized by entity type in subdirectories (`company/`, `feature/`, `note/`, `product/`, `component/`, `feature_status/`, `initiative/`, `objective/`)
- **Tests**: `src/__tests__/` - Vitest unit tests

### Tool Pattern
Each tool follows a consistent pattern:
1. **Tool Definition**: Exported tool object with name, description, and JSON schema
2. **Request Interface**: TypeScript interface defining expected parameters
3. **Implementation Function**: Async function that calls the Productboard API

Example structure in `src/feature/get_features.ts`:
- `getFeaturesTool` - Tool definition
- `GetFeaturesRequest` - Request interface
- `getFeatures()` - Implementation function

### API Client Architecture
The `ProductboardClient` class (`src/productboard_client.ts`) provides:
- Bearer token authentication
- Standard headers including API version
- Base URL configuration
- GET request wrapper with 30s timeout and HTTP error handling (throws on non-2xx)
- All URL path parameters are `encodeURIComponent`-encoded before use

### Tool Registration
All tools are registered in `src/index.ts` in two places:
1. CallToolRequest handler - Switch statement for execution
2. ListToolsRequest handler - Array of available tools

### Available Tools
- `get_companies` / `get_company_detail` - Company management
- `get_components` / `get_component_detail` - Product components
- `get_features` / `get_feature_detail` - Feature management
- `get_feature_statuses` - Feature status tracking
- `get_notes` / `get_note_detail` - Note management
- `get_products` / `get_product_detail` - Product management
- `get_initiatives` / `get_initiative_detail` / `get_initiative_features` - Initiative management
- `get_objectives` / `get_objective_detail` - Objective management

### Pagination
List endpoints support pagination with `page` parameter. The API uses `pageOffset` calculation: `(page - 1) * 100` for page sizes of 100.

## Testing

Tests live in `src/__tests__/` and use Vitest. The HTTP client is mocked via `vi.stubGlobal('fetch', ...)` so no real API calls are made.

Key areas covered:
- `productboard_client` — timeout, HTTP error handling, successful responses
- Each tool module — correct endpoint construction, pagination, `encodeURIComponent` on IDs
- `index.ts` routing — each tool name dispatches to the right handler
