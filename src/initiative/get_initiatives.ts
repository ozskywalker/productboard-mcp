import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";

const getInitiativesTool: Tool = {
    "name": "get_initiatives",
    "description": "Returns a list of all initiatives. This API uses cursor-based pagination",
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

interface GetInitiativesRequest {
    pageCursor?: string
}

const getInitiatives = async (request: GetInitiativesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=initiative"
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getInitiativesTool, GetInitiativesRequest, getInitiatives }
