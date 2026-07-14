import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { resolvePageCursor } from "../pagination.js";
import { fieldsQueryString } from "../fields.js";
import { readOnlyAnnotations } from "../tool_annotations.js";
import { listEnvelopeOutputSchema } from "../output_schemas.js";

const getNoteRelationshipsTool: Tool = {
    "name": "get_note_relationships",
    "description": "Returns a note's relationships: its 'customer' relationship (the single User or Company it's tied to) and/or its 'link' relationships (Feature/Subfeature/Product/Component). This API uses cursor-based pagination. IMPORTANT: this operates on ONE note at a time and is not a bulk filter — Productboard's v2 API has no endpoint to list 'all notes for company X' directly. To find notes tied to a company you must still list notes (get_notes) and check each one's relationships (or call this tool per note); that remains an O(N) operation over your notes. v2's relationship endpoint returns target stubs ({id, type, links}) rather than full objects — set expand=true to have this tool resolve each stub's full detail for you (bounded to the current page)",
    "inputSchema": {
        "type": "object",
        "properties": {
            "noteId": {
                "type": "string",
                "description": "ID of the note whose relationships to retrieve"
            },
            "type": {
                "type": "string",
                "enum": ["customer", "link"],
                "description": "Return only relationships of this kind: 'customer' (the note's related User or Company) or 'link' (the note's related Feature/Subfeature/Product/Component)"
            },
            "targetType": {
                "type": "string",
                "enum": ["user", "company", "feature", "subfeature", "product", "component"],
                "description": "Return only relationships whose target is of this entity type"
            },
            "targetId": {
                "type": "string",
                "description": "Return only the relationship whose target has this exact ID — combine with targetType to directly test whether this note relates to a specific entity (e.g. a specific company) in one call, without expand"
            },
            "limit": {
                "type": "integer",
                "minimum": 1,
                "description": "Maximum number of relationships to return per page"
            },
            "expand": {
                "type": "boolean",
                "description": "If true, resolves each relationship target's full detail instead of returning target stubs. Only expands the current page — paginate with pageCursor to expand further pages. A target that fails to resolve is returned as { id, type, error } instead of failing the whole call"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "When expand is true, return only these fields per resolved target entity to reduce response size (e.g. [\"name\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty. Ignored when expand is false"
            },
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results — pass either the bare cursor token or the full links.next URL from the previous response"
            }
        },
        "required": ["noteId"]
    },
    "outputSchema": listEnvelopeOutputSchema,
    "annotations": readOnlyAnnotations("Get Note Relationships")
}

interface GetNoteRelationshipsRequest {
    noteId: string
    type?: string
    targetType?: string
    targetId?: string
    limit?: number
    expand?: boolean
    fields?: string[]
    pageCursor?: string
}

// Mirrors initiative/get_initiative_features.ts's expand pattern. If a third
// tool needs this, consider extracting to a shared module.
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

const expandRelationshipTarget = async (target: { id: string; type: string }, fields?: string[]): Promise<any> => {
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

const getNoteRelationships = async (request: GetNoteRelationshipsRequest): Promise<any> => {
    const params = new URLSearchParams()

    if (request.type) {
        params.append('type', request.type)
    }
    if (request.targetType) {
        params.append('target[type]', request.targetType)
    }
    if (request.targetId) {
        params.append('target[id]', request.targetId)
    }
    if (request.limit !== undefined) {
        params.append('limit', String(request.limit))
    }
    const pageCursor = resolvePageCursor(request.pageCursor)
    if (pageCursor) {
        params.append('pageCursor', pageCursor)
    }

    const queryString = params.toString()
    const endpoint = `/notes/${encodeURIComponent(request.noteId)}/relationships${queryString ? `?${queryString}` : ''}`

    const relationships = await productboardClient.get(endpoint)

    if (!request.expand) {
        return relationships
    }

    const targets: Array<{ id: string; type: string }> = (relationships?.data ?? []).map((item: any) => item.target)
    const expandedTargets = await mapWithConcurrency(
        targets,
        EXPAND_CONCURRENCY,
        (target) => expandRelationshipTarget(target, request.fields)
    )

    return { data: expandedTargets, links: relationships?.links }
}

export { getNoteRelationshipsTool, GetNoteRelationshipsRequest, getNoteRelationships }
