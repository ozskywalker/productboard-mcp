import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";

const getFeaturesTool: Tool = {
    "name": "get_features",
    "description": "Returns a list of all features. This API uses cursor-based pagination",
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

interface GetFeaturesRequest {
    pageCursor?: string
}

const getFeatures = async (request: GetFeaturesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=feature"
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getFeaturesTool, GetFeaturesRequest, getFeatures }
