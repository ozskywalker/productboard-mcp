import { describe, it, expect } from "vitest"
import { listEnvelopeOutputSchema, detailEnvelopeOutputSchema } from "../output_schemas.js"

describe("output schemas", () => {
    it("listEnvelopeOutputSchema describes a data array with an optional links.next cursor", () => {
        expect(listEnvelopeOutputSchema).toEqual({
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
        })
    })

    it("detailEnvelopeOutputSchema describes a single data object", () => {
        expect(detailEnvelopeOutputSchema).toEqual({
            type: "object",
            properties: {
                data: { type: "object", additionalProperties: true },
            },
            required: ["data"],
            additionalProperties: true,
        })
    })
})
