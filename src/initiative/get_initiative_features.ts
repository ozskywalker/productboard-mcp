import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";

const getInitiativeFeaturesTool: Tool = {
    "name": "get_initiative_features",
    "description": "Returns the features linked to a specific initiative. This API uses cursor-based pagination. Note: v2 has no expand support on this endpoint, so results are link stubs ({id, type, links}) rather than full feature objects — pass each id to get_feature_detail for full data",
    "inputSchema": {
        "type": "object",
        "properties": {
            "initiativeId": {
                "type": "string",
                "description": "ID of the initiative whose features to retrieve"
            },
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results — pass either the bare cursor token or the full links.next URL from the previous response"
            }
        },
        "required": ["initiativeId"]
    }
}

interface GetInitiativeFeaturesRequest {
    initiativeId: string
    pageCursor?: string
}

const getInitiativeFeatures = async (request: GetInitiativeFeaturesRequest): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(request.initiativeId)}/relationships?type=link&target[type]=feature`
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getInitiativeFeaturesTool, GetInitiativeFeaturesRequest, getInitiativeFeatures }
