import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { fieldsQueryString } from "../fields.js";

const getComponentDetailTool: Tool = {
    "name": "get_component_detail",
    "description": "Returns detailed information about a specific component",
    "inputSchema": {
        "type": "object",
        "properties": {
            "componentId": {
                "type": "string",
                "description": "ID of the component to retrieve"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            }
        },
        "required": ["componentId"]
    }
}

interface GetComponentDetailRequest {
    componentId: string
    fields?: string[]
}

const getComponentDetail = async (request: GetComponentDetailRequest): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(request.componentId)}`
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `?${fieldsParam}`
    }

    return productboardClient.get(endpoint)
}

export { getComponentDetailTool, GetComponentDetailRequest, getComponentDetail }
