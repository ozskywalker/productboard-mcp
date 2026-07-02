import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getInitiativesTool: Tool = {
    "name": "get_initiatives",
    "description": "Returns a list of all initiatives. This API is paginated and the page limit is always 100",
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

interface GetInitiativesRequest {
    page?: number
}

const getInitiatives = async (request: GetInitiativesRequest): Promise<any> => {
    let endpoint = "/initiatives"
    if (request.page && request.page > 1) {
        endpoint += `?pageOffset=${(request.page - 1) * 100}`
    }

    return productboardClient.get(endpoint)
}

export { getInitiativesTool, GetInitiativesRequest, getInitiatives }
