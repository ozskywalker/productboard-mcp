import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Productboard entities carry workspace-configurable custom fields, so no
// tool can honestly declare a strict per-field output schema. Every list
// endpoint (/entities, /notes, /entities/fields/{id}/values,
// /entities/{id}/relationships) shares this cursor-pagination envelope.
export const listEnvelopeOutputSchema: Tool["outputSchema"] = {
    type: "object",
    properties: {
        data: { type: "array", items: { type: "object", additionalProperties: true } },
        links: {
            type: "object",
            properties: { next: { type: ["string", "null"] } },
            additionalProperties: true,
        },
    },
    required: ["data"],
    additionalProperties: true,
}

// Every detail endpoint (/entities/{id}, /notes/{id}) shares this
// single-entity envelope.
export const detailEnvelopeOutputSchema: Tool["outputSchema"] = {
    type: "object",
    properties: {
        data: { type: "object", additionalProperties: true },
    },
    required: ["data"],
    additionalProperties: true,
}
