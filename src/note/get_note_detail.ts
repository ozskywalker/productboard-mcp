import { Tool } from "@modelcontextprotocol/sdk/types.js";
import productboardClient from "../productboard_client.js";
import { fieldsQueryString } from "../fields.js";
import { readOnlyAnnotations } from "../tool_annotations.js";
import { detailEnvelopeOutputSchema } from "../output_schemas.js";

const getNoteDetailTool: Tool = {
    "name": "get_note_detail",
    "description": "Returns detailed information about a specific note",
    "inputSchema": {
        "type": "object",
        "properties": {
            "noteId": {
                "type": "string",
                "description": "ID of the note to retrieve"
            },
            "fields": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Return only these fields to reduce response size (e.g. [\"name\", \"tags\"]). Pass [\"all\"] to include fields that are otherwise omitted when empty"
            }
        },
        "required": ["noteId"]
    },
    "outputSchema": detailEnvelopeOutputSchema,
    "annotations": readOnlyAnnotations("Get Note Detail")
}

interface GetNoteDetailRequest {
    noteId: string
    fields?: string[]
}

const getNoteDetail = async (request: GetNoteDetailRequest): Promise<any> => {
    let endpoint = `/notes/${encodeURIComponent(request.noteId)}`
    const fieldsParam = fieldsQueryString(request.fields)
    if (fieldsParam) {
        endpoint += `?${fieldsParam}`
    }

    return productboardClient.get(endpoint)
}

export { getNoteDetailTool, GetNoteDetailRequest, getNoteDetail }
