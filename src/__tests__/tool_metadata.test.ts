import { describe, it, expect, vi } from "vitest"

vi.stubEnv("PRODUCTBOARD_ACCESS_TOKEN", "test-token")
vi.mock("../productboard_client.js", () => ({
    default: { get: vi.fn() },
}))

import { Tool } from "@modelcontextprotocol/sdk/types.js"
import { listEnvelopeOutputSchema, detailEnvelopeOutputSchema } from "../output_schemas.js"

import { getProductsTool } from "../product/get_products.js"
import { getProductDetailTool } from "../product/get_product_detail.js"
import { getFeaturesTool } from "../feature/get_features.js"
import { getFeatureDetailTool } from "../feature/get_feature_detail.js"
import { getComponentsTool } from "../component/get_components.js"
import { getComponentDetailTool } from "../component/get_component_detail.js"
import { getFeatureStatusesTool } from "../feature_status/get_feature_statuses.js"
import { getNotesTool } from "../note/get_notes.js"
import { getNoteDetailTool } from "../note/get_note_detail.js"
import { getNoteRelationshipsTool } from "../note/get_note_relationships.js"
import { getCompaniesTool } from "../company/get_companies.js"
import { getCompanyDetailTool } from "../company/get_company_detail.js"
import { getInitiativesTool } from "../initiative/get_initiatives.js"
import { getInitiativeDetailTool } from "../initiative/get_initiative_detail.js"
import { getInitiativeFeaturesTool } from "../initiative/get_initiative_features.js"
import { getObjectivesTool } from "../objective/get_objectives.js"
import { getObjectiveDetailTool } from "../objective/get_objective_detail.js"

const LIST_TOOLS: Tool[] = [
    getProductsTool,
    getFeaturesTool,
    getComponentsTool,
    getFeatureStatusesTool,
    getNotesTool,
    getNoteRelationshipsTool,
    getCompaniesTool,
    getInitiativesTool,
    getInitiativeFeaturesTool,
    getObjectivesTool,
]

const DETAIL_TOOLS: Tool[] = [
    getProductDetailTool,
    getFeatureDetailTool,
    getComponentDetailTool,
    getNoteDetailTool,
    getCompanyDetailTool,
    getInitiativeDetailTool,
    getObjectiveDetailTool,
]

const ALL_TOOLS: Tool[] = [...LIST_TOOLS, ...DETAIL_TOOLS]

describe("tool metadata completeness", () => {
    it("covers exactly 17 tools", () => {
        expect(ALL_TOOLS).toHaveLength(17)
    })

    it.each(ALL_TOOLS.map((tool) => [tool.name, tool] as const))(
        "%s declares read-only annotations with a title",
        (_name, tool) => {
            expect(tool.annotations).toMatchObject({
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true,
            })
            expect(tool.annotations?.title).toBeTruthy()
        }
    )
})

describe("output schema classification", () => {
    it.each(LIST_TOOLS.map((tool) => [tool.name, tool] as const))(
        "%s uses the shared list envelope schema",
        (_name, tool) => {
            expect(tool.outputSchema).toBe(listEnvelopeOutputSchema)
        }
    )

    it.each(DETAIL_TOOLS.map((tool) => [tool.name, tool] as const))(
        "%s uses the shared detail envelope schema",
        (_name, tool) => {
            expect(tool.outputSchema).toBe(detailEnvelopeOutputSchema)
        }
    )
})
