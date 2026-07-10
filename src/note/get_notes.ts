import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";

const getNotesTool: Tool = {
    "name": "get_notes",
    "description": "Returns a list of all notes. This API uses cursor-based pagination. Note: the v1 'term' (full-text search), 'featureId', 'companyId', 'anyTag'/'allTags', and 'last' filters have no v2 equivalent and are not supported",
    "inputSchema": {
        "type": "object",
        "properties": {
            "type": {
                "type": "string",
                "enum": ["textNote", "conversationNote", "opportunityNote"],
                "description": "Return only notes of this type"
            },
            "archived": {
                "type": "boolean",
                "description": "Return only notes with this archived status"
            },
            "processed": {
                "type": "boolean",
                "description": "Return only notes with this processed status"
            },
            "createdFrom": {
                "type": "string",
                "format": "date-time",
                "description": "Return only notes created on or after this date-time"
            },
            "createdTo": {
                "type": "string",
                "format": "date-time",
                "description": "Return only notes created on or before this date-time"
            },
            "updatedFrom": {
                "type": "string",
                "format": "date-time",
                "description": "Return only notes updated on or after this date-time"
            },
            "updatedTo": {
                "type": "string",
                "format": "date-time",
                "description": "Return only notes updated on or before this date-time"
            },
            "ownerEmail": {
                "type": "string",
                "description": "Return only notes owned by a specific owner email"
            },
            "creatorEmail": {
                "type": "string",
                "description": "Return only notes created by a specific creator email"
            },
            "sourceSystem": {
                "type": "string",
                "description": "Return only notes from a specific source system"
            },
            "sourceRecordId": {
                "type": "string",
                "description": "Return only notes with a specific source record ID"
            },
            "pageCursor": {
                "type": "string",
                "description": "Cursor for the next page of results, taken from the previous response's links.next"
            }
        }
    }
}

interface GetNotesRequest {
    type?: string;
    archived?: boolean;
    processed?: boolean;
    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
    ownerEmail?: string;
    creatorEmail?: string;
    sourceSystem?: string;
    sourceRecordId?: string;
    pageCursor?: string;
}

const getNotes = async (request: GetNotesRequest): Promise<any> => {
    const params = new URLSearchParams()

    if (request.type) {
        params.append('type[]', request.type)
    }
    if (request.archived !== undefined) {
        params.append('archived', String(request.archived))
    }
    if (request.processed !== undefined) {
        params.append('processed', String(request.processed))
    }
    if (request.createdFrom) {
        params.append('createdFrom', request.createdFrom)
    }
    if (request.createdTo) {
        params.append('createdTo', request.createdTo)
    }
    if (request.updatedFrom) {
        params.append('updatedFrom', request.updatedFrom)
    }
    if (request.updatedTo) {
        params.append('updatedTo', request.updatedTo)
    }
    if (request.ownerEmail) {
        params.append('owner[email]', request.ownerEmail)
    }
    if (request.creatorEmail) {
        params.append('creator[email]', request.creatorEmail)
    }
    if (request.sourceSystem) {
        params.append('metadata[source][system]', request.sourceSystem)
    }
    if (request.sourceRecordId) {
        params.append('metadata[source][recordId]', request.sourceRecordId)
    }
    if (request.pageCursor) {
        params.append('pageCursor', request.pageCursor)
    }

    const queryString = params.toString()
    const endpoint = `/notes${queryString ? `?${queryString}` : ''}`

    return productboardClient.get(endpoint)
}

export { getNotesTool, GetNotesRequest, getNotes }
