import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getInitiativesTool: Tool = {
    "name": "get_initiatives",
    "description": "Returns a list of all initiatives. This API uses cursor-based pagination",
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

interface GetInitiativesRequest {
    pageCursor?: string
}

const getInitiatives = async (request: GetInitiativesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=initiative"
    if (request.pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(request.pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getInitiativesTool, GetInitiativesRequest, getInitiatives }
