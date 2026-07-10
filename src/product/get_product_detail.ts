import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { fieldsQueryString } from "../fields.js";

const getProductDetailTool: Tool = {
    "name": "get_product_detail",
    "description": "Returns detailed information about a specific product",
    "inputSchema": {
        "type": "object",
        "properties": {
            "productId": {
                "type": "string",
                "description": "ID of the product to retrieve"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            }
        },
        "required": ["productId"]
    }
}

interface GetProductDetailRequest {
    productId: string
    fields?: string[]
}

const getProductDetail = async (request: GetProductDetailRequest): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(request.productId)}`
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `?${fieldsParam}`
    }

    return productboardClient.get(endpoint)
}

export { getProductDetailTool, GetProductDetailRequest, getProductDetail }
