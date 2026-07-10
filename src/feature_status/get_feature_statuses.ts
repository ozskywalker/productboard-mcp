import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";
import { readOnlyAnnotations } from "../tool_annotations.js";

const getFeatureStatusesTool: Tool = {
    "name": "get_feature_statuses",
    "description": "Returns a list of all feature statuses. This API uses cursor-based pagination",
    "inputSchema": {
        "type": "object",
        "properties": {
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results — pass either the bare cursor token or the full links.next URL from the previous response"
            }
        }
    },
    "annotations": readOnlyAnnotations("Get Feature Statuses")
}

interface GetFeatureStatusesRequest {
    pageCursor?: string
}

// v2 has no dedicated feature-statuses endpoint: status is a workspace-configurable
// field, so its field id must be looked up via the feature entity configuration
// before its allowed values can be listed.
const findStatusFieldId = async (): Promise<string> => {
    const configuration = await productboardClient.get("/entities/configurations/feature")
    const fields = Object.values(configuration?.data?.fields ?? {}) as Array<{ id: string; name?: string; path?: string }>
    const statusField = fields.find((field) => field.path === "status" || field.name?.toLowerCase() === "status")

    if (!statusField) {
        throw new Error("Could not find the 'status' field in the feature entity configuration")
    }

    return statusField.id
}

const getFeatureStatuses = async (request: GetFeatureStatusesRequest): Promise<any> => {
    const statusFieldId = await findStatusFieldId()

    let endpoint = `/entities/fields/${encodeURIComponent(statusFieldId)}/values?assignedEntityType[]=feature`
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    return productboardClient.get(endpoint)
}

export { getFeatureStatusesTool, GetFeatureStatusesRequest, getFeatureStatuses }
