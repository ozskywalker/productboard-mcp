import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { fieldsQueryString } from "../fields.js";

const getFeatureDetailTool: Tool = {
    "name": "get_feature_detail",
    "description": "Returns detailed information about a specific feature",
    "inputSchema": {
        "type": "object",
        "properties": {
            "featureId": {
                "type": "string",
                "description": "ID of the feature to retrieve"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            }
        },
        "required": ["featureId"]
    }
}

interface GetFeatureDetailRequest {
    featureId: string
    fields?: string[]
}

const getFeatureDetail = async (request: GetFeatureDetailRequest): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(request.featureId)}`
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `?${fieldsParam}`
    }

    return productboardClient.get(endpoint)
}

export { getFeatureDetailTool, GetFeatureDetailRequest, getFeatureDetail }
