import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getInitiativeDetailTool: Tool = {
    "name": "get_initiative_detail",
    "description": "Returns detailed information about a specific initiative",
    "inputSchema": {
        "type": "object",
        "properties": {
            "initiativeId": {
                "type": "string",
                "description": "ID of the initiative to retrieve"
            }
        },
        "required": ["initiativeId"]
    }
}

interface GetInitiativeDetailRequest {
    initiativeId: string
}

const getInitiativeDetail = async (request: GetInitiativeDetailRequest): Promise<any> => {
    const endpoint = `/initiatives/${encodeURIComponent(request.initiativeId)}`
    return productboardClient.get(endpoint)
}

export { getInitiativeDetailTool, GetInitiativeDetailRequest, getInitiativeDetail }
