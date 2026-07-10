import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getObjectivesTool: Tool = {
    "name": "get_objectives",
    "description": "Returns a list of all objectives. This API uses cursor-based pagination",
    "inputSchema": {
        "type": "object",
        "properties": {
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results, taken from the previous response's links.next"
            }
        }
    }
}

interface GetObjectivesRequest {
    pageCursor?: string
}

const getObjectives = async (request: GetObjectivesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=objective"
    if (request.pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(request.pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getObjectivesTool, GetObjectivesRequest, getObjectives }
