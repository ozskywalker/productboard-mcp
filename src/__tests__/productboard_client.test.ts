import { describe, it, expect, vi, afterEach } from "vitest"

vi.stubEnv("PRODUCTBOARD_ACCESS_TOKEN", "test-token")

// Dynamic import so the env stub is in place before the module executes
const { default: productboardClient } = await import("../productboard_client.js")

function makeFetch(status: number, body: unknown, headers: Record<string, string> = {}): typeof fetch {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
    } as unknown as Response)
}

// Queues a distinct response per call, unlike makeFetch's single repeated response.
function makeSequentialFetch(
    responses: Array<{ status: number; body: unknown; headers?: Record<string, string> }>
): typeof fetch {
    const mockFetch = vi.fn()
    for (const { status, body, headers = {} } of responses) {
        mockFetch.mockResolvedValueOnce({
            ok: status >= 200 && status < 300,
            status,
            headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
            json: () => Promise.resolve(body),
            text: () => Promise.resolve(JSON.stringify(body)),
        } as unknown as Response)
    }
    return mockFetch as unknown as typeof fetch
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

    it("includes Content-Type header", async () => {
        const mockFetch = makeFetch(200, {})
        vi.stubGlobal("fetch", mockFetch)

        await productboardClient.get("/features")

        const [, init] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect((init as RequestInit).headers).toMatchObject({
            "Content-Type": "application/json",
        })
    })

    it("constructs the full URL from the v2 base + endpoint", async () => {
        const mockFetch = makeFetch(200, {})
        vi.stubGlobal("fetch", mockFetch)

        await productboardClient.get("/features")

        const [url] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(url).toBe("https://api.productboard.com/v2/features")
    })

    it("returns parsed JSON on success", async () => {
        const payload = { data: [{ id: "1" }] }
        vi.stubGlobal("fetch", makeFetch(200, payload))

        const result = await productboardClient.get("/features")

        expect(result).toEqual(payload)
    })

    // Finding #7 — parametrize error status codes instead of duplicating tests
    it.each([400, 401, 403, 404])(
        "throws immediately with status code on %d response",
        async (status) => {
            const mockFetch = makeFetch(status, { message: "error" })
            vi.stubGlobal("fetch", mockFetch)

            await expect(productboardClient.get("/any")).rejects.toThrow(
                `Productboard API error ${status}`
            )
            expect(mockFetch).toHaveBeenCalledTimes(1)
        }
    )

    describe("retryable statuses", () => {
        afterEach(() => {
            vi.useRealTimers()
        })

        it("retries once on 429 then succeeds", async () => {
            const mockFetch = makeSequentialFetch([
                { status: 429, body: { message: "rate limited" } },
                { status: 200, body: { data: [] } },
            ])
            vi.stubGlobal("fetch", mockFetch)
            vi.useFakeTimers()

            const getPromise = productboardClient.get("/any")
            await vi.advanceTimersByTimeAsync(300)

            await expect(getPromise).resolves.toEqual({ data: [] })
            expect(mockFetch).toHaveBeenCalledTimes(2)
        })

        it("retries through repeated 5xx before succeeding", async () => {
            const mockFetch = makeSequentialFetch([
                { status: 500, body: { message: "error" } },
                { status: 502, body: { message: "error" } },
                { status: 200, body: { data: [] } },
            ])
            vi.stubGlobal("fetch", mockFetch)
            vi.useFakeTimers()

            const getPromise = productboardClient.get("/any")
            await vi.advanceTimersByTimeAsync(2_000)

            await expect(getPromise).resolves.toEqual({ data: [] })
            expect(mockFetch).toHaveBeenCalledTimes(3)
        })

        it("exhausts retries and throws with an attempt-count suffix on persistent 429", async () => {
            const mockFetch = makeFetch(429, { message: "rate limited" })
            vi.stubGlobal("fetch", mockFetch)
            vi.useFakeTimers()

            const getPromise = productboardClient.get("/any")
            const assertion = expect(getPromise).rejects.toThrow(/Productboard API error 429:.*attempts/)
            await vi.advanceTimersByTimeAsync(10_000)

            await assertion
            expect(mockFetch).toHaveBeenCalledTimes(4)
        })

        it("honors an integer-seconds Retry-After header over computed backoff", async () => {
            const mockFetch = makeSequentialFetch([
                { status: 429, body: { message: "rate limited" }, headers: { "retry-after": "2" } },
                { status: 200, body: { data: [] } },
            ])
            vi.stubGlobal("fetch", mockFetch)
            vi.useFakeTimers()

            const getPromise = productboardClient.get("/any")
            await vi.advanceTimersByTimeAsync(1_999)
            expect(mockFetch).toHaveBeenCalledTimes(1)

            await vi.advanceTimersByTimeAsync(1)
            await expect(getPromise).resolves.toEqual({ data: [] })
            expect(mockFetch).toHaveBeenCalledTimes(2)
        })

        it("falls back to computed backoff when Retry-After is not a simple integer", async () => {
            const mockFetch = makeSequentialFetch([
                {
                    status: 429,
                    body: { message: "rate limited" },
                    headers: { "retry-after": "Wed, 21 Oct 2026 07:28:00 GMT" },
                },
                { status: 200, body: { data: [] } },
            ])
            vi.stubGlobal("fetch", mockFetch)
            vi.useFakeTimers()

            const getPromise = productboardClient.get("/any")
            await vi.advanceTimersByTimeAsync(300)

            await expect(getPromise).resolves.toEqual({ data: [] })
            expect(mockFetch).toHaveBeenCalledTimes(2)
        })
    })

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
