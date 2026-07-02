import { describe, it, expect, vi, beforeAll } from "vitest"

// Must be set before index.ts is imported
vi.stubEnv("PRODUCTBOARD_ACCESS_TOKEN", "test-token")

// ---------------------------------------------------------------------------
// Shared state — vi.hoisted ensures these are available inside vi.mock factories
// ---------------------------------------------------------------------------
const { handlers, mocks } = vi.hoisted(() => {
    const makeImpl = (data: unknown) => vi.fn().mockResolvedValue({ data })
    return {
        // Keyed by the schema identifier strings we assign below
        handlers: {} as Record<string, (req: unknown) => Promise<unknown>>,
        mocks: {
            getFeatures:          makeImpl([]),
            getFeatureDetail:     makeImpl({}),
            getCompanies:         makeImpl([]),
            getCompanyDetail:     makeImpl({}),
            getComponents:        makeImpl([]),
            getComponentDetail:   makeImpl({}),
            getFeatureStatuses:   makeImpl([]),
            getNotes:             makeImpl([]),
            getNoteDetail:        makeImpl({}),
            getProducts:          makeImpl([]),
            getProductDetail:     makeImpl({}),
            getInitiatives:       makeImpl([]),
            getInitiativeDetail:  makeImpl({}),
            getInitiativeFeatures: makeImpl([]),
            getObjectives:        makeImpl([]),
            getObjectiveDetail:   makeImpl({}),
        },
    }
})

// ---------------------------------------------------------------------------
// SDK mocks
// Use plain string sentinels for the schema objects so setRequestHandler
// calls are keyed predictably in `handlers`.
// ---------------------------------------------------------------------------
vi.mock("@modelcontextprotocol/sdk/types.js", () => ({
    CallToolRequestSchema: "__CALL__",
    ListToolsRequestSchema: "__LIST__",
}))

vi.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
    // Must use `function` keyword so Vitest allows `new Server(...)` in index.ts
    Server: vi.fn(function (this: {
        setRequestHandler: (schema: string, handler: (req: unknown) => Promise<unknown>) => void
        connect: () => Promise<void>
    }) {
        this.setRequestHandler = (schema, handler) => {
            handlers[schema] = handler
        }
        this.connect = vi.fn().mockResolvedValue(undefined)
    }),
}))

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
    StdioServerTransport: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Tool module mocks — each returns its real tool name so the switch matches
// ---------------------------------------------------------------------------
vi.mock("../feature/get_features.js", () => ({
    getFeaturesTool: { name: "get_features" },
    getFeatures: mocks.getFeatures,
}))
vi.mock("../feature/get_feature_detail.js", () => ({
    getFeatureDetailTool: { name: "get_feature_detail" },
    getFeatureDetail: mocks.getFeatureDetail,
}))
vi.mock("../company/get_companies.js", () => ({
    getCompaniesTool: { name: "get_companies" },
    getCompanies: mocks.getCompanies,
}))
vi.mock("../company/get_company_detail.js", () => ({
    getCompanyDetailTool: { name: "get_company_detail" },
    getCompanyDetail: mocks.getCompanyDetail,
}))
vi.mock("../component/get_components.js", () => ({
    getComponentsTool: { name: "get_components" },
    getComponents: mocks.getComponents,
}))
vi.mock("../component/get_component_detail.js", () => ({
    getComponentDetailTool: { name: "get_component_detail" },
    getComponentDetail: mocks.getComponentDetail,
}))
vi.mock("../feature_status/get_feature_statuses.js", () => ({
    getFeatureStatusesTool: { name: "get_feature_statuses" },
    getFeatureStatuses: mocks.getFeatureStatuses,
}))
vi.mock("../note/get_notes.js", () => ({
    getNotesTool: { name: "get_notes" },
    getNotes: mocks.getNotes,
}))
vi.mock("../note/get_note_detail.js", () => ({
    getNoteDetailTool: { name: "get_note_detail" },
    getNoteDetail: mocks.getNoteDetail,
}))
vi.mock("../product/get_products.js", () => ({
    getProductsTool: { name: "get_products" },
    getProducts: mocks.getProducts,
}))
vi.mock("../product/get_product_detail.js", () => ({
    getProductDetailTool: { name: "get_product_detail" },
    getProductDetail: mocks.getProductDetail,
}))
vi.mock("../initiative/get_initiatives.js", () => ({
    getInitiativesTool: { name: "get_initiatives" },
    getInitiatives: mocks.getInitiatives,
}))
vi.mock("../initiative/get_initiative_detail.js", () => ({
    getInitiativeDetailTool: { name: "get_initiative_detail" },
    getInitiativeDetail: mocks.getInitiativeDetail,
}))
vi.mock("../initiative/get_initiative_features.js", () => ({
    getInitiativeFeaturesTool: { name: "get_initiative_features" },
    getInitiativeFeatures: mocks.getInitiativeFeatures,
}))
vi.mock("../objective/get_objectives.js", () => ({
    getObjectivesTool: { name: "get_objectives" },
    getObjectives: mocks.getObjectives,
}))
vi.mock("../objective/get_objective_detail.js", () => ({
    getObjectiveDetailTool: { name: "get_objective_detail" },
    getObjectiveDetail: mocks.getObjectiveDetail,
}))

// ---------------------------------------------------------------------------
// Boot index.ts — main() runs synchronously up to its first await, so
// setRequestHandler calls complete before this import resolves.
// ---------------------------------------------------------------------------
beforeAll(async () => {
    await import("../index.js")
})

function callTool(name: string, args: Record<string, unknown> = {}) {
    return handlers["__CALL__"]({ params: { name, arguments: args } }) as Promise<{
        content: Array<{ type: string; text: string }>
    }>
}

// ---------------------------------------------------------------------------
// Routing — every tool name dispatches to the right implementation
// Finding #1: index.ts switch statement was completely untested
// ---------------------------------------------------------------------------
const ROUTES: Array<{
    name: string
    mockKey: keyof typeof mocks
    args?: Record<string, unknown>
}> = [
    { name: "get_features",           mockKey: "getFeatures" },
    { name: "get_feature_detail",     mockKey: "getFeatureDetail",    args: { featureId: "f1" } },
    { name: "get_companies",          mockKey: "getCompanies" },
    { name: "get_company_detail",     mockKey: "getCompanyDetail",    args: { companyId: "c1" } },
    { name: "get_components",         mockKey: "getComponents" },
    { name: "get_component_detail",   mockKey: "getComponentDetail",  args: { componentId: "c1" } },
    { name: "get_feature_statuses",   mockKey: "getFeatureStatuses" },
    { name: "get_notes",              mockKey: "getNotes" },
    { name: "get_note_detail",        mockKey: "getNoteDetail",       args: { noteId: "n1" } },
    { name: "get_products",           mockKey: "getProducts" },
    { name: "get_product_detail",     mockKey: "getProductDetail",    args: { productId: "p1" } },
    { name: "get_initiatives",        mockKey: "getInitiatives" },
    { name: "get_initiative_detail",  mockKey: "getInitiativeDetail", args: { initiativeId: "i1" } },
    { name: "get_initiative_features",mockKey: "getInitiativeFeatures", args: { initiativeId: "i1" } },
    { name: "get_objectives",         mockKey: "getObjectives" },
    { name: "get_objective_detail",   mockKey: "getObjectiveDetail",  args: { objectiveId: "o1" } },
]

describe("CallToolRequest routing", () => {
    it.each(ROUTES)("routes $name to the correct handler", async ({ name, mockKey, args }) => {
        mocks[mockKey].mockClear()

        const result = await callTool(name, args ?? {})

        expect(mocks[mockKey]).toHaveBeenCalledOnce()
        expect(result.content[0].type).toBe("text")
        // Response should contain the serialised mock return value
        expect(JSON.parse(result.content[0].text)).toMatchObject({ data: expect.anything() })
    })

    // Finding #4 — error paths through the catch block
    it("returns { error } content when the implementation throws", async () => {
        mocks.getFeatures.mockRejectedValueOnce(new Error("API is down"))

        const result = await callTool("get_features")

        const body = JSON.parse(result.content[0].text)
        expect(body.error).toBe("API is down")
    })

    it("returns { error } content for an unknown tool name", async () => {
        const result = await callTool("nonexistent_tool")

        const body = JSON.parse(result.content[0].text)
        expect(body.error).toMatch(/Unknown tool/)
    })
})

// ---------------------------------------------------------------------------
// ListToolsRequest — registration completeness
// Finding #1: verify the list matches what the switch can handle
// ---------------------------------------------------------------------------
describe("ListToolsRequest", () => {
    it("returns exactly 16 tools", async () => {
        const result = (await handlers["__LIST__"]({})) as { tools: Array<{ name: string }> }
        expect(result.tools).toHaveLength(16)
    })

    it("registers every tool that the switch can route", async () => {
        const result = (await handlers["__LIST__"]({})) as { tools: Array<{ name: string }> }
        const registeredNames = result.tools.map((t) => t.name)
        const routableNames = ROUTES.map((r) => r.name)

        // Every name the switch handles must appear in the list
        for (const name of routableNames) {
            expect(registeredNames).toContain(name)
        }

        // Every name in the list must have a corresponding switch case
        for (const name of registeredNames) {
            expect(routableNames).toContain(name)
        }
    })
})
