import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { fieldsQueryString } from "../fields.js";

const getInitiativeDetailTool: Tool = {
    "name": "get_initiative_detail",
    "description": "Returns detailed information about a specific initiative",
    "inputSchema": {
        "type": "object",
        "properties": {
            "initiativeId": {
                "type": "string",
                "description": "ID of the initiative to retrieve"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            }
        },
        "required": ["initiativeId"]
    }
}

interface GetInitiativeDetailRequest {
    initiativeId: string
    fields?: string[]
}

const getInitiativeDetail = async (request: GetInitiativeDetailRequest): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(request.initiativeId)}`
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `?${fieldsParam}`
    }

    return productboardClient.get(endpoint)
}

export { getInitiativeDetailTool, GetInitiativeDetailRequest, getInitiativeDetail }
