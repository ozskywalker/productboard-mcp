import { describe, it, expect } from "vitest"
import { fieldsQueryString, appendFields } from "../fields.js"

describe("fieldsQueryString", () => {
    it("returns an empty string when no fields are given", () => {
        expect(fieldsQueryString(undefined)).toBe("")
        expect(fieldsQueryString([])).toBe("")
    })

    it("builds a repeated fields[] query string", () => {
        expect(fieldsQueryString(["name", "status"])).toBe("fields[]=name&fields[]=status")
    })

    it("encodes field names", () => {
        expect(fieldsQueryString(["a b"])).toBe("fields[]=a%20b")
    })
})

describe("appendFields", () => {
    it("does nothing when fields is undefined", () => {
        const params = new URLSearchParams()
        appendFields(params, undefined)
        expect(params.toString()).toBe("")
    })

    it("appends one fields[] entry per field", () => {
        const params = new URLSearchParams()
        appendFields(params, ["name", "tags"])
        expect(params.toString()).toBe("fields%5B%5D=name&fields%5B%5D=tags")
    })
})
