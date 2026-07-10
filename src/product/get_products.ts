import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";

const getProductsTool: Tool = {
    "name": "get_products",
    "description": "Returns detail of all products. This API uses cursor-based pagination",
    "inputSchema": {
        "type": "object",
        "properties": {
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results — pass either the bare cursor token or the full links.next URL from the previous response"
            }
        }
    }
}

interface GetProductsRequest {
    pageCursor?: string
}

const getProducts = async (request: GetProductsRequest): Promise<any> => {
    let endpoint = "/entities?type[]=product"
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getProductsTool, GetProductsRequest, getProducts }
