import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getProductsTool: Tool = {
    "name": "get_products",
    "description": "Returns detail of all products. This API uses cursor-based pagination",
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

interface GetProductsRequest {
    pageCursor?: string
}

const getProducts = async (request: GetProductsRequest): Promise<any> => {
    let endpoint = "/entities?type[]=product"
    if (request.pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(request.pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getProductsTool, GetProductsRequest, getProducts }
