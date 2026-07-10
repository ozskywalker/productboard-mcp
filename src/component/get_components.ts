import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getComponentsTool: Tool = {
    "name": "get_components",
    "description": "Returns a list of all components. This API uses cursor-based pagination",
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

interface GetComponentsRequest {
    pageCursor?: string
}

const getComponents = async (request: GetComponentsRequest): Promise<any> => {
    let endpoint = "/entities?type[]=component"
    if (request.pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(request.pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getComponentsTool, GetComponentsRequest, getComponents }
