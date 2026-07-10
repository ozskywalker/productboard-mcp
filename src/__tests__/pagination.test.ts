import { describe, it, expect } from "vitest"
import { resolvePageCursor } from "../pagination.js"

describe("resolvePageCursor", () => {
    it("returns undefined when no cursor is given", () => {
        expect(resolvePageCursor(undefined)).toBeUndefined()
    })

    it("passes through a bare cursor token unchanged", () => {
        expect(resolvePageCursor("XeljBR")).toBe("XeljBR")
    })

    it("extracts the pageCursor value from a full links.next URL", () => {
        const nextUrl = "https://api.productboard.com/v2/entities?type[]=feature&pageCursor=XeljBR"
        expect(resolvePageCursor(nextUrl)).toBe("XeljBR")
    })

    it("falls back to the raw input if the URL has no pageCursor param", () => {
        const nextUrl = "https://api.productboard.com/v2/entities?type[]=feature"
        expect(resolvePageCursor(nextUrl)).toBe(nextUrl)
    })

    it("falls back to the raw input if the URL fails to parse", () => {
        expect(resolvePageCursor("http://")).toBe("http://")
    })
})
