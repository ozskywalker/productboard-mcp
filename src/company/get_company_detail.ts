import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { fieldsQueryString } from "../fields.js";
import { readOnlyAnnotations } from "../tool_annotations.js";
import { detailEnvelopeOutputSchema } from "../output_schemas.js";

const getCompanyDetailTool: Tool = {
    "name": "get_company_detail",
    "description": "Returns detailed information about a specific company",
    "inputSchema": {
        "type": "object",
        "properties": {
            "companyId": {
                "type": "string",
                "description": "ID of the company to retrieve"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            }
        },
        "required": ["companyId"]
    },
    "outputSchema": detailEnvelopeOutputSchema,
    "annotations": readOnlyAnnotations("Get Company Detail")
}

interface GetCompanyDetailRequest {
    companyId: string
    fields?: string[]
}

const getCompanyDetail = async (request: GetCompanyDetailRequest): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(request.companyId)}`
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `?${fieldsParam}`
    }

    return productboardClient.get(endpoint)
}

export { getCompanyDetailTool, GetCompanyDetailRequest, getCompanyDetail }
