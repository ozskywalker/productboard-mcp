import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";
import { fieldsQueryString } from "../fields.js";
import { readOnlyAnnotations } from "../tool_annotations.js";
import { listEnvelopeOutputSchema } from "../output_schemas.js";

const getInitiativeFeaturesTool: Tool = {
    "name": "get_initiative_features",
    "description": "Returns the features linked to a specific initiative. This API uses cursor-based pagination. v2's relationship endpoint returns link stubs ({id, type, links}) rather than full feature objects — set expand=true to have this tool resolve each stub's full feature detail for you (bounded to the current page)",
    "inputSchema": {
        "type": "object",
        "properties": {
            "initiativeId": {
                "type": "string",
                "description": "ID of the initiative whose features to retrieve"
            },
            "expand": {
                "type": "boolean",
                "description": "If true, resolves each linked feature's full detail instead of returning link stubs. Only expands the current page — paginate with pageCursor to expand further pages. A feature that fails to resolve is returned as { id, type, error } instead of failing the whole call"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "When expand is true, return only these fields per feature to reduce response size (e.g. [\"name\", \"status\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty. Ignored when expand is false"
            },
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results — pass either the bare cursor token or the full links.next URL from the previous response"
            }
        },
        "required": ["initiativeId"]
    },
    "outputSchema": listEnvelopeOutputSchema,
    "annotations": readOnlyAnnotations("Get Initiative Features")
}

interface GetInitiativeFeaturesRequest {
    initiativeId: string
    expand?: boolean
    fields?: string[]
    pageCursor?: string
}

// Caps how many expand lookups run at once so a single call can't blow past
// Productboard's 50 req/sec/token rate limit on a large page of link stubs.
const EXPAND_CONCURRENCY = 10

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = new Array(items.length)
    let nextIndex = 0

    async function worker() {
        while (nextIndex < items.length) {
            const current = nextIndex++
            results[current] = await fn(items[current])
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
    return results
}

const expandFeatureStub = async (target: { id: string; type: string }, fields?: string[]): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(target.id)}`
    const fieldsParam = fieldsQueryString(fields)
    if (fieldsParam) {
        endpoint += `?${fieldsParam}`
    }

    try {
        const response = await productboardClient.get(endpoint)
        return response?.data ?? response
    } catch (err) {
        return { id: target.id, type: target.type, error: err instanceof Error ? err.message : String(err) }
    }
}

const getInitiativeFeatures = async (request: GetInitiativeFeaturesRequest): Promise<any> => {
    let endpoint = `/entities/${encodeURIComponent(request.initiativeId)}/relationships?type=link&target[type]=feature`
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        endpoint += `&pageCursor=${encodeURIComponent(pageCursor)}`
    }

    const relationships = await productboardClient.get(endpoint)

    if (!request.expand) {
        return relationships
    }

    const targets: Array<{ id: string; type: string }> = (relationships?.data ?? []).map((item: any) => item.target)
    const expandedFeatures = await mapWithConcurrency(
        targets,
        EXPAND_CONCURRENCY,
        (target) => expandFeatureStub(target, request.fields)
    )

    return { data: expandedFeatures, links: relationships?.links }
}

export { getInitiativeFeaturesTool, GetInitiativeFeaturesRequest, getInitiativeFeatures }
