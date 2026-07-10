// Productboard's `links.next` is a full URL whose query string bundles the
// cursor together with the original request's filters (e.g. `...&pageCursor=abc&type[]=feature`).
// Callers naturally copy that whole value out of a response, so accept either
// the bare cursor token or the full URL and extract the token ourselves.
export function resolvePageCursor(pageCursor?: string): string | undefined {
    if (!pageCursor) {
        return undefined
    }
    if (!/^https?:\/\//i.test(pageCursor)) {
        return pageCursor
    }
    try {
        return new URL(pageCursor).searchParams.get("pageCursor") ?? pageCursor
    } catch {
        return pageCursor
    }
}
