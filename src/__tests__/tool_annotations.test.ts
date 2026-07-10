import { describe, it, expect } from "vitest"
import { readOnlyAnnotations } from "../tool_annotations.js"

describe("readOnlyAnnotations", () => {
    it("returns the read-only hint shape for a given title", () => {
        expect(readOnlyAnnotations("Get Companies")).toEqual({
            title: "Get Companies",
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        })
    })

    it("uses the given title verbatim", () => {
        expect(readOnlyAnnotations("Get Feature Detail").title).toBe("Get Feature Detail")
    })
})
