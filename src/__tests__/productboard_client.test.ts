import { describe, it, expect, vi, afterEach } from "vitest"

vi.stubEnv("PRODUCTBOARD_ACCESS_TOKEN", "test-token")

// Dynamic import so the env stub is in place before the module executes
const { default: productboardClient } = await import("../productboard_client.js")

function makeFetch(status: number, body: unknown): typeof fetch {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
    } as unknown as Response)
}

describe("ProductboardClient", () => {
    afterEach(() => {
        vi.restoreAllMocks()
        vi.useRealTimers() // safety net in case a test uses fake timers and fails mid-run
    })

    it("sends Authorization header with Bearer token", async () => {
        const mockFetch = makeFetch(200, { data: [] })
        vi.stubGlobal("fetch", mockFetch)

        await productboardClient.get("/features")

        const [, init] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect((init as RequestInit).headers).toMatchObject({
            Authorization: "Bearer test-token",
        })
    })

    it("includes X-Version and Content-Type headers", async () => {
        const mockFetch = makeFetch(200, {})
        vi.stubGlobal("fetch", mockFetch)

        await productboardClient.get("/features")

        const [, init] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect((init as RequestInit).headers).toMatchObject({
            "X-Version": "1",
            "Content-Type": "application/json",
        })
    })

    it("constructs the full URL from base + endpoint", async () => {
        const mockFetch = makeFetch(200, {})
        vi.stubGlobal("fetch", mockFetch)

        await productboardClient.get("/features")

        const [url] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(url).toBe("https://api.productboard.com/features")
    })

    it("returns parsed JSON on success", async () => {
        const payload = { data: [{ id: "1" }] }
        vi.stubGlobal("fetch", makeFetch(200, payload))

        const result = await productboardClient.get("/features")

        expect(result).toEqual(payload)
    })

    // Finding #7 — parametrize error status codes instead of duplicating tests
    it.each([400, 401, 403, 404, 429, 500])(
        "throws with status code on %d response",
        async (status) => {
            vi.stubGlobal("fetch", makeFetch(status, { message: "error" }))

            await expect(productboardClient.get("/any")).rejects.toThrow(
                `Productboard API error ${status}`
            )
        }
    )

    it("throws a timeout error when fetch is aborted", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockImplementation((_url: string, init: RequestInit) =>
                new Promise((_resolve, reject) => {
                    init.signal?.addEventListener("abort", () => {
                        const err = new Error("The operation was aborted")
                        err.name = "AbortError"
                        reject(err)
                    })
                })
            )
        )

        vi.useFakeTimers()
        const getPromise = productboardClient.get("/features")
        vi.advanceTimersByTime(30_001)

        await expect(getPromise).rejects.toThrow("timed out")
    })
})
