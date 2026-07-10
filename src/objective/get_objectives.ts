import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";

const getObjectivesTool: Tool = {
    "name": "get_objectives",
    "description": "Returns a list of all objectives. This API uses cursor-based pagination",
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

interface GetObjectivesRequest {
    pageCursor?: string
}

const getObjectives = async (request: GetObjectivesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=objective"
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getObjectivesTool, GetObjectivesRequest, getObjectives }
