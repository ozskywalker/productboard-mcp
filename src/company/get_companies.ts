import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";
import { fieldsQueryString } from "../fields.js";

const getCompaniesTool: Tool = {
    "name": "get_companies",
    "description": "Returns a list of all companies. This API uses cursor-based pagination",
    "inputSchema": {
        "type": "object",
        "properties": {
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            },
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results — pass either the bare cursor token or the full links.next URL from the previous response"
            }
        }
    }
}

interface GetCompaniesRequest {
    fields?: string[]
    pageCursor?: string
}

const getCompanies = async (request: GetCompaniesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=company"
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `&${fieldsParam}`
    }
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getCompaniesTool, GetCompaniesRequest, getCompanies }
