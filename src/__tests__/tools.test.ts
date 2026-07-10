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
// List tools — entity type filter & cursor pagination
// ---------------------------------------------------------------------------

describe("getFeatures", () => {
    it("calls /entities filtered by type=feature", async () => {
        await getFeatures({})
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=feature")
    })

    it("appends pageCursor when provided", async () => {
        await getFeatures({ pageCursor: "cursor-1" })
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=feature&pageCursor=cursor-1")
    })

    it("resolves a full links.next URL down to its bare cursor token", async () => {
        await getFeatures({
            pageCursor: "https://api.productboard.com/v2/entities?type[]=feature&pageCursor=cursor-1",
        })
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=feature&pageCursor=cursor-1")
    })

    it("appends fields[] when provided", async () => {
        await getFeatures({ fields: ["name", "status"] })
        expect(mockGet).toHaveBeenCalledWith(
            "/entities?type[]=feature&fields[]=name&fields[]=status"
        )
    })
})

describe("getCompanies", () => {
    it("calls /entities filtered by type=company", async () => {
        await getCompanies({})
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=company")
    })

    it("appends pageCursor when provided", async () => {
        await getCompanies({ pageCursor: "cursor-1" })
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=company&pageCursor=cursor-1")
    })
})

describe("getComponents", () => {
    it("calls /entities filtered by type=component", async () => {
        await getComponents({})
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=component")
    })

    it("appends pageCursor when provided", async () => {
        await getComponents({ pageCursor: "cursor-1" })
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=component&pageCursor=cursor-1")
    })
})

describe("getProducts", () => {
    it("calls /entities filtered by type=product", async () => {
        await getProducts({})
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=product")
    })

    it("appends pageCursor when provided", async () => {
        await getProducts({ pageCursor: "cursor-1" })
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=product&pageCursor=cursor-1")
    })
})

describe("getInitiatives", () => {
    it("calls /entities filtered by type=initiative", async () => {
        await getInitiatives({})
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=initiative")
    })

    it("appends pageCursor when provided", async () => {
        await getInitiatives({ pageCursor: "cursor-1" })
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=initiative&pageCursor=cursor-1")
    })
})

describe("getObjectives", () => {
    it("calls /entities filtered by type=objective", async () => {
        await getObjectives({})
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=objective")
    })

    it("appends pageCursor when provided", async () => {
        await getObjectives({ pageCursor: "cursor-1" })
        expect(mockGet).toHaveBeenCalledWith("/entities?type[]=objective&pageCursor=cursor-1")
    })
})

describe("getFeatureStatuses", () => {
    it("looks up the status field id, then lists its values for features", async () => {
        mockGet.mockResolvedValueOnce({
            data: {
                fields: {
                    "field-1": { id: "field-1", name: "Name" },
                    "field-2": { id: "field-2", name: "Status", path: "status" },
                },
            },
        })
        mockGet.mockResolvedValueOnce({ data: [] })

        await getFeatureStatuses({})

        expect(mockGet).toHaveBeenNthCalledWith(1, "/entities/configurations/feature")
        expect(mockGet).toHaveBeenNthCalledWith(
            2,
            "/entities/fields/field-2/values?assignedEntityType[]=feature"
        )
    })

    it("appends pageCursor to the values lookup", async () => {
        mockGet.mockResolvedValueOnce({
            data: { fields: { "field-2": { id: "field-2", path: "status" } } },
        })
        mockGet.mockResolvedValueOnce({ data: [] })

        await getFeatureStatuses({ pageCursor: "cursor-1" })

        expect(mockGet).toHaveBeenNthCalledWith(
            2,
            "/entities/fields/field-2/values?assignedEntityType[]=feature&pageCursor=cursor-1"
        )
    })

    it("throws when no status field is found in the configuration", async () => {
        mockGet.mockResolvedValueOnce({ data: { fields: {} } })

        await expect(getFeatureStatuses({})).rejects.toThrow(
            "Could not find the 'status' field"
        )
    })
})

// ---------------------------------------------------------------------------
// getNotes — cursor pagination + filter params
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
        await getNotes({ type: "textNote", ownerEmail: "a@example.com" })
        const call = mockGet.mock.calls[0][0] as string
        expect(call).toContain("type%5B%5D=textNote")
        expect(call).toContain("owner%5Bemail%5D=a%40example.com")
    })

    it("appends fields[] when provided", async () => {
        await getNotes({ fields: ["name", "tags"] })
        expect(mockGet).toHaveBeenCalledWith("/notes?fields%5B%5D=name&fields%5B%5D=tags")
    })
})

// ---------------------------------------------------------------------------
// Detail tools — correct endpoint + encodeURIComponent
// ---------------------------------------------------------------------------
describe("getFeatureDetail", () => {
    it("calls /entities/:id", async () => {
        await getFeatureDetail({ featureId: "abc-123" })
        expect(mockGet).toHaveBeenCalledWith("/entities/abc-123")
    })

    it("appends fields[] when provided", async () => {
        await getFeatureDetail({ featureId: "abc-123", fields: ["name", "status"] })
        expect(mockGet).toHaveBeenCalledWith("/entities/abc-123?fields[]=name&fields[]=status")
    })

    it("encodes special characters in featureId", async () => {
        await getFeatureDetail({ featureId: "a/b c" })
        expect(mockGet).toHaveBeenCalledWith("/entities/a%2Fb%20c")
    })
})

describe("getCompanyDetail", () => {
    it("calls /entities/:id", async () => {
        await getCompanyDetail({ companyId: "comp-1" })
        expect(mockGet).toHaveBeenCalledWith("/entities/comp-1")
    })

    it("encodes special characters in companyId", async () => {
        await getCompanyDetail({ companyId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/entities/a%2Fb")
    })
})

describe("getComponentDetail", () => {
    it("calls /entities/:id", async () => {
        await getComponentDetail({ componentId: "cmp-99" })
        expect(mockGet).toHaveBeenCalledWith("/entities/cmp-99")
    })

    it("encodes special characters in componentId", async () => {
        await getComponentDetail({ componentId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/entities/a%2Fb")
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
    it("calls /entities/:id", async () => {
        await getProductDetail({ productId: "prod-42" })
        expect(mockGet).toHaveBeenCalledWith("/entities/prod-42")
    })

    it("encodes special characters in productId", async () => {
        await getProductDetail({ productId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/entities/a%2Fb")
    })
})

describe("getInitiativeDetail", () => {
    it("calls /entities/:id", async () => {
        await getInitiativeDetail({ initiativeId: "init-5" })
        expect(mockGet).toHaveBeenCalledWith("/entities/init-5")
    })

    it("encodes special characters in initiativeId", async () => {
        await getInitiativeDetail({ initiativeId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/entities/a%2Fb")
    })
})

describe("getInitiativeFeatures", () => {
    it("calls /entities/:id/relationships filtered to feature links", async () => {
        await getInitiativeFeatures({ initiativeId: "init-5" })
        expect(mockGet).toHaveBeenCalledWith(
            "/entities/init-5/relationships?type=link&target[type]=feature"
        )
    })

    it("appends pageCursor when provided", async () => {
        await getInitiativeFeatures({ initiativeId: "init-5", pageCursor: "cursor-1" })
        expect(mockGet).toHaveBeenCalledWith(
            "/entities/init-5/relationships?type=link&target[type]=feature&pageCursor=cursor-1"
        )
    })

    it("encodes special characters in initiativeId", async () => {
        await getInitiativeFeatures({ initiativeId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith(
            "/entities/a%2Fb/relationships?type=link&target[type]=feature"
        )
    })
})

describe("getObjectiveDetail", () => {
    it("calls /entities/:id", async () => {
        await getObjectiveDetail({ objectiveId: "obj-3" })
        expect(mockGet).toHaveBeenCalledWith("/entities/obj-3")
    })

    it("encodes special characters in objectiveId", async () => {
        await getObjectiveDetail({ objectiveId: "a/b" })
        expect(mockGet).toHaveBeenCalledWith("/entities/a%2Fb")
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
