import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getObjectiveDetailTool: Tool = {
    "name": "get_objective_detail",
    "description": "Returns detailed information about a specific objective",
    "inputSchema": {
        "type": "object",
        "properties": {
            "objectiveId": {
                "type": "string",
                "description": "ID of the objective to retrieve"
            }
        },
        "required": ["objectiveId"]
    }
}

interface GetObjectiveDetailRequest {
    objectiveId: string
}

const getObjectiveDetail = async (request: GetObjectiveDetailRequest): Promise<any> => {
    const endpoint = `/entities/${encodeURIComponent(request.objectiveId)}`
    return productboardClient.get(endpoint)
}

export { getObjectiveDetailTool, GetObjectiveDetailRequest, getObjectiveDetail }
