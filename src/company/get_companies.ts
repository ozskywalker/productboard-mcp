import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";

const getCompaniesTool: Tool = {
    "name": "get_companies",
    "description": "Returns a list of all companies. This API uses cursor-based pagination",
    "inputSchema": {
        "type": "object",
        "properties": {
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results — pass either the bare cursor token or the full links.next URL from the previous response"
            }
        }
    }
}

interface GetCompaniesRequest {
    pageCursor?: string
}

const getCompanies = async (request: GetCompaniesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=company"
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getCompaniesTool, GetCompaniesRequest, getCompanies }
