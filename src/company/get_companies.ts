import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getCompaniesTool: Tool = {
    "name": "get_companies",
    "description": "Returns a list of all companies. This API uses cursor-based pagination",
    "inputSchema": {
        "type": "object",
        "properties": {
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results, taken from the previous response's links.next"
            }
        }
    }
}

interface GetCompaniesRequest {
    pageCursor?: string
}

const getCompanies = async (request: GetCompaniesRequest): Promise<any> => {
    let endpoint = "/entities?type[]=company"
    if (request.pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(request.pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getCompaniesTool, GetCompaniesRequest, getCompanies }
