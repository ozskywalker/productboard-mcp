import { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

// Every tool in this server is a safe, read-only GET against Productboard:
// it never mutates state, is safe to call speculatively, and repeated calls
// with the same arguments return the same kind of result.
export function readOnlyAnnotations(title: string): ToolAnnotations {
    return {
        title,
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    }
}
