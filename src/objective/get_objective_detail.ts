import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { fieldsQueryString } from "../fields.js";

const getObjectiveDetailTool: Tool = {
    "name": "get_objective_detail",
    "description": "Returns detailed information about a specific objective",
    "inputSchema": {
        "type": "object",
        "properties": {
            "objectiveId": {
                "type": "string",
                "description": "ID of the objective to retrieve"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            }
        },
        "required": ["objectiveId"]
    }
}

interface GetObjectiveDetailRequest {
    objectiveId: string
    fields?: string[]
}

const getObjectiveDetail = async (request: GetObjectiveDetailRequest): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(request.objectiveId)}`
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `?${fieldsParam}`
    }

    return productboardClient.get(endpoint)
}

export { getObjectiveDetailTool, GetObjectiveDetailRequest, getObjectiveDetail }
