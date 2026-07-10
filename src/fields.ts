// v2 list/detail endpoints default to returning only non-empty fields.
// Callers can pass `fields[]=all` for every field, or specific field names
// to keep large entities (with nested relationships/metadata) out of context.
export function fieldsQueryString(fields?: string[]): string {
    if (!fields || fields.length === 0) {
        return ""
    }
    return fields.map((field) => `fields[]=${encodeURIComponent(field)}`).join("&")
}

export function appendFields(params: URLSearchParams, fields?: string[]): void {
    if (!fields) {
        return
    }
    for (const field of fields) {
        params.append("fields[]", field)
    }
}
