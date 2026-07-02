import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getObjectivesTool: Tool = {
    "name": "get_objectives",
    "description": "Returns a list of all objectives. This API is paginated and the page limit is always 100",
    "inputSchema": {
        "type": "object",
        "properties": {
            "page": {
                "type": "number",
                "default": 1
            }
        }
    }
}

interface GetObjectivesRequest {
    page?: number
}

const getObjectives = async (request: GetObjectivesRequest): Promise<any> => {
    let endpoint = "/objectives"
    if (request.page && request.page > 1) {
        endpoint += `?pageOffset=${(request.page - 1) * 100}`
    }

    return productboardClient.get(endpoint)
}

export { getObjectivesTool, GetObjectivesRequest, getObjectives }
