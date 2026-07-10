import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getFeaturesTool: Tool = {
    "name": "get_features",
    "description": "Returns a list of all features. This API uses cursor-based pagination",
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

interface GetFeaturesRequest {
    pageCursor?: string
}

const getFeatures = async (request: GetFeaturesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=feature"
    if (request.pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(request.pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getFeaturesTool, GetFeaturesRequest, getFeatures }
