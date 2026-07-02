import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getInitiativeFeaturesTool: Tool = {
    "name": "get_initiative_features",
    "description": "Returns all features linked to a specific initiative",
    "inputSchema": {
        "type": "object",
        "properties": {
            "initiativeId": {
                "type": "string",
                "description": "ID of the initiative whose features to retrieve"
            },
            "page": {
                "type": "number",
                "default": 1
            }
        },
        "required": ["initiativeId"]
    }
}

interface GetInitiativeFeaturesRequest {
    initiativeId: string
    page?: number
}

const getInitiativeFeatures = async (request: GetInitiativeFeaturesRequest): Promise<any> => {
    let endpoint = `/initiatives/${encodeURIComponent(request.initiativeId)}/features`
    if (request.page && request.page > 1) {
        endpoint += `?pageOffset=${(request.page - 1) * 100}`
    }

    return productboardClient.get(endpoint)
}

export { getInitiativeFeaturesTool, GetInitiativeFeaturesRequest, getInitiativeFeatures }
