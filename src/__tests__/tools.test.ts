import { describe, it, expect, vi, beforeEach } from "vitest"

vi.stubEnv("PRODUCTBOARD_ACCESS_TOKEN", "test-token")

vi.mock("../productboard_client.js", () => ({
    default: { get: vi.fn() },
}))

import productboardClient from "../productboard_client.js"
const mockGet = productboardClient.get as ReturnType<typeof vi.fn>

import { getFeatures } from "../feature/get_features.js"
import { getFeatureDetail, getFeatureDetailTool } from "../feature/get_feature_detail.js"
import { getCompanies } from "../company/get_companies.js"
import { getCompanyDetail, getCompanyDetailTool } from "../company/get_company_detail.js"
import { getComponents } from "../component/get_components.js"
import { getComponentDetail, getComponentDetailTool } from "../component/get_component_detail.js"
import { getNotes } from "../note/get_notes.js"
import { getNoteDetail, getNoteDetailTool } from "../note/get_note_detail.js"
import { getProducts } from "../product/get_products.js"
import { getProductDetail, getProductDetailTool } from "../product/get_product_detail.js"
import { getFeatureStatuses } from "../feature_status/get_feature_statuses.js"
import { getInitiatives } from "../initiative/get_initiatives.js"
import { getInitiativeDetail, getInitiativeDetailTool } from "../initiative/get_initiative_detail.js"
import { getInitiativeFeatures, getInitiativeFeaturesTool } from "../initiative/get_initiative_features.js"
import { getObjectives } from "../objective/get_objectives.js"
import { getObjectiveDetail, getObjectiveDetailTool } from "../objective/get_objective_detail.js"

beforeEach(() => {
    mockGet.mockReset()
    mockGet.mockResolvedValue({ data: [] })
})

// ---------------------------------------------------------------------------
// List tools — endpoint & pagination
// Finding #2: split into separate it cases per page value
// Finding #8: include page=undefined and page=1 as distinct cases
// ---------------------------------------------------------------------------

describe("getFeatures", () => {
    it.each([
        [undefined, "/features"],
        [1,         "/features"],
        [2,         "/features?pageOffset=100"],
        [3,         "/features?pageOffset=200"],
    ] as [number | undefined, string][])("page=%s → %s", async (page, expected) => {
        await getFeatures({ page })
        expect(mockGet).toHaveBeenCalledWith(expected)
    })
})

describe("getCompanies", () => {
    it.each([
        [undefined, "/companies"],
        [1,         "/companies"],
        [2,         "/companies?pageOffset=100"],
        [3,         "/companies?pageOffset=200"],
    ] as [number | undefined, string][])("page=%s → %s", async (page, expected) => {
        await getCompanies({ page })
        expect(mockGet).toHaveBeenCalledWith(expected)
    })
})

describe("getComponents", () => {
    it.each([
        [undefined, "/components"],
        [1,         "/components"],
        [2,         "/components?pageOffset=100"],
        [3,         "/components?pageOffset=200"],
    ] as [number | undefined, string][])("page=%s → %s", async (page, expected) => {
        await getComponents({ page })
        expect(mockGet).toHaveBeenCalledWith(expected)
    })
})

describe("getProducts", () => {
    it.each([
        [undefined, "/products"],
        [1,         "/products"],
        [2,         "/products?pageOffset=100"],
        [3,         "/products?pageOffset=200"],
    ] as [number | undefined, string][])("page=%s → %s", async (page, expected) => {
        await getProducts({ page })
        expect(mockGet).toHaveBeenCalledWith(expected)
    })
})

describe("getInitiatives", () => {
    it.each([
        [undefined, "/initiatives"],
        [1,         "/initiatives"],
        [2,         "/initiatives?pageOffset=100"],
        [3,         "/initiatives?pageOffset=200"],
    ] as [number | undefined, string][])("page=%s → %s", async (page, expected) => {
        await getInitiatives({ page })
        expect(mockGet).toHaveBeenCalledWith(expected)
    })
})

describe("getObjectives", () => {
    it.each([
        [undefined, "/objectives"],
        [1,         "/objectives"],
        [2,         "/objectives?pageOffset=100"],
        [3,         "/objectives?pageOffset=200"],
    ] as [number | undefined, string][])("page=%s → %s", async (page, expected) => {
        await getObjectives({ page })
        expect(mockGet).toHaveBeenCalledWith(expected)
    })
})

// Finding #3: getFeatureStatuses pagination was never exercised beyond page 1
describe("getFeatureStatuses", () => {
    it.each([
        [undefined, "/feature-statuses"],
        [1,         "/feature-statuses"],
        [2,         "/feature-statuses?pageOffset=100"],
        [3,         "/feature-statuses?pageOffset=200"],
    ] as [number | undefined, string][])("page=%s → %s", async (page, expected) => {
        await getFeatureStatuses({ page })
        expect(mockGet).toHaveBeenCalledWith(expected)
    })
})

// ---------------------------------------------------------------------------
// getNotes — cursor pagination + filter params + validation
// Finding #6: add last+createdTo combination test
// ---------------------------------------------------------------------------
describe("getNotes", () => {
    it("calls /notes with no params when none supplied", async () => {
        await getNotes({})
        expect(mockGet).toHaveBeenCalledWith("/notes")
    })

    it("appends pageCursor when provided", async () => {
        await getNotes({ pageCursor: "cursor-abc" })
        expect(mockGet).toHaveBeenCalledWith("/notes?pageCursor=cursor-abc")
    })

    it("appends filter params to query string", async () => {
        await getNotes({ term: "hello", companyId: "c-1" })
        const call = mockGet.mock.calls[0][0] as string
        expect(call).toContain("term=hello")
        expect(call).toContain("companyId=c-1")
    })

    it("throws when last is combined with createdFrom", async () => {
        await expect(getNotes({ last: "7d", createdFrom: "2024-01-01" })).rejects.toThrow(
            "'last' parameter cannot be combined with 'createdFrom' or 'createdTo'"
        )
    })

    it("throws when last is combined with createdTo", async () => {
        await expect(getNotes({ last: "7d", createdTo: "2024-01-31" })).rejects.toThrow(
            "'last' parameter cannot be combined with 'createdFrom' or 'createdTo'"
        )
    })

    it("throws when anyTag and allTags are both provided", async () => {
        await expect(getNotes({ anyTag: "a", allTags: "b" })).rejects.toThrow(
            "'anyTag' cannot be combined with 'allTags'"
        )
    })
})

// ---------------------------------------------------------------------------
// Detail tools — correct endpoint + encodeURIComponent
// ---------------------------------------------------------------------------
describe("getFeatureDetail", () => {
    it("calls /features/:id", async () => {
        await getFeatureDetail({ featureId: "abc-123" })
        expect(mockGet).toHaveBeenCalledWith("/features/abc-123")
    })

    it("encodes special characters in featureId", async () => {
        await getFeatureDetail({ featureId: "a/b c" })
        expect(mockGet).toHaveBeenCalledWith("/features/a%2Fb%20c")
    })
})

describe("getCompanyDetail", () => {
    it("calls /companies/:id", async () => {
        await getCompanyDetail({ companyId: "comp-1" })
        expect(mockGet).toHaveBeenCalledWith("/companies/comp-1")
    })

    it("encodes special characters in companyId", async () => {
        await getCompanyDetail({ companyId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/companies/a%2Fb")
    })
})

describe("getComponentDetail", () => {
    it("calls /components/:id", async () => {
        await getComponentDetail({ componentId: "cmp-99" })
        expect(mockGet).toHaveBeenCalledWith("/components/cmp-99")
    })

    it("encodes special characters in componentId", async () => {
        await getComponentDetail({ componentId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/components/a%2Fb")
    })
})

describe("getNoteDetail", () => {
    it("calls /notes/:id", async () => {
        await getNoteDetail({ noteId: "note-7" })
        expect(mockGet).toHaveBeenCalledWith("/notes/note-7")
    })

    it("encodes special characters in noteId", async () => {
        await getNoteDetail({ noteId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/notes/a%2Fb")
    })
})

describe("getProductDetail", () => {
    it("calls /products/:id", async () => {
        await getProductDetail({ productId: "prod-42" })
        expect(mockGet).toHaveBeenCalledWith("/products/prod-42")
    })

    it("encodes special characters in productId", async () => {
        await getProductDetail({ productId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/products/a%2Fb")
    })
})

describe("getInitiativeDetail", () => {
    it("calls /initiatives/:id", async () => {
        await getInitiativeDetail({ initiativeId: "init-5" })
        expect(mockGet).toHaveBeenCalledWith("/initiatives/init-5")
    })

    it("encodes special characters in initiativeId", async () => {
        await getInitiativeDetail({ initiativeId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/initiatives/a%2Fb")
    })
})

describe("getInitiativeFeatures", () => {
    it("calls /initiatives/:id/features", async () => {
        await getInitiativeFeatures({ initiativeId: "init-5" })
        expect(mockGet).toHaveBeenCalledWith("/initiatives/init-5/features")
    })

    it("paginates correctly", async () => {
        await getInitiativeFeatures({ initiativeId: "init-5", page: 2 })
        expect(mockGet).toHaveBeenCalledWith("/initiatives/init-5/features?pageOffset=100")
    })

    it("encodes special characters in initiativeId", async () => {
        await getInitiativeFeatures({ initiativeId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/initiatives/a%2Fb/features")
    })
})

describe("getObjectiveDetail", () => {
    it("calls /objectives/:id", async () => {
        await getObjectiveDetail({ objectiveId: "obj-3" })
        expect(mockGet).toHaveBeenCalledWith("/objectives/obj-3")
    })

    it("encodes special characters in objectiveId", async () => {
        await getObjectiveDetail({ objectiveId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/objectives/a%2Fb")
    })
})

// ---------------------------------------------------------------------------
// Tool input schemas — required fields
// Finding #5: cover all detail tools, not just featureDetail
// ---------------------------------------------------------------------------
describe("tool input schemas declare required fields", () => {
    it.each([
        ["get_feature_detail",      getFeatureDetailTool,      "featureId"],
        ["get_company_detail",      getCompanyDetailTool,      "companyId"],
        ["get_component_detail",    getComponentDetailTool,    "componentId"],
        ["get_note_detail",         getNoteDetailTool,         "noteId"],
        ["get_product_detail",      getProductDetailTool,      "productId"],
        ["get_initiative_detail",   getInitiativeDetailTool,   "initiativeId"],
        ["get_initiative_features", getInitiativeFeaturesTool, "initiativeId"],
        ["get_objective_detail",    getObjectiveDetailTool,    "objectiveId"],
    ] as [string, { inputSchema: { required?: string[] } }, string][])(
        "%s requires %s",
        (_toolName, tool, field) => {
            expect(tool.inputSchema.required).toContain(field)
        }
    )
})
