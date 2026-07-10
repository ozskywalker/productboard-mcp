import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";

const getComponentsTool: Tool = {
    "name": "get_components",
    "description": "Returns a list of all components. This API uses cursor-based pagination",
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

interface GetComponentsRequest {
    pageCursor?: string
}

const getComponents = async (request: GetComponentsRequest): Promise<any> => {
    let endpoint = "/entities?type[]=component"
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getComponentsTool, GetComponentsRequest, getComponents }
