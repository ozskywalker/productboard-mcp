import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";
import { fieldsQueryString } from "../fields.js";

const getProductsTool: Tool = {
    "name": "get_products",
    "description": "Returns detail of all products. This API uses cursor-based pagination",
    "inputSchema": {
        "type": "object",
        "properties": {
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            },
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results — pass either the bare cursor token or the full links.next URL from the previous response"
            }
        }
    }
}

interface GetProductsRequest {
    fields?: string[]
    pageCursor?: string
}

const getProducts = async (request: GetProductsRequest): Promise<any> => {
    let endpoint = "/entities?type[]=product"
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `&${fieldsParam}`
    }
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getProductsTool, GetProductsRequest, getProducts }
