class ProductboardClient {
    private accessToken: string
    private baseUrl = "https://api.productboard.com/v2"
    private headers: { [key: string]: string };

    private static readonly MAX_RETRIES = 3
    private static readonly RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])
    private static readonly BASE_BACKOFF_MS = 300
    private static readonly MAX_BACKOFF_MS = 5_000
    private static readonly MAX_RETRY_AFTER_MS = 10_000

    constructor(accessToken: string) {
        this.accessToken = accessToken
        this.headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    // Prefers a Retry-After value from the server, but only its simple
    // integer-seconds form — the HTTP-date form falls back to our own backoff
    // rather than parsing dates.
    private computeBackoffMs(attempt: number, retryAfterHeader: string | null): number {
        if (retryAfterHeader !== null) {
            const seconds = Number(retryAfterHeader)
            if (Number.isFinite(seconds) && seconds >= 0) {
                return Math.min(seconds * 1000, ProductboardClient.MAX_RETRY_AFTER_MS)
            }
        }
        return Math.min(ProductboardClient.BASE_BACKOFF_MS * 2 ** attempt, ProductboardClient.MAX_BACKOFF_MS)
    }

    async get(endpoint: string) {
        for (let attempt = 0; ; attempt++) {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 30_000)

            let response: Response
            try {
                response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: "GET",
                    headers: this.headers,
                    signal: controller.signal,
                })
            } catch (err) {
                if ((err as Error).name === "AbortError") {
                    throw new Error(`Request timed out after 30s: ${endpoint}`)
                }
                throw err
            } finally {
                clearTimeout(timeout)
            }

            if (response.ok) {
                return response.json()
            }

            const body = await response.text()
            const retryable = ProductboardClient.RETRYABLE_STATUSES.has(response.status)

            if (!retryable || attempt >= ProductboardClient.MAX_RETRIES) {
                const suffix = retryable ? ` (still failing after ${attempt + 1} attempts)` : ""
                throw new Error(`Productboard API error ${response.status}: ${body}${suffix}`)
            }

            await this.sleep(this.computeBackoffMs(attempt, response.headers.get("retry-after")))
        }
    }
}

const productboardAccessToken = process.env.PRODUCTBOARD_ACCESS_TOKEN

if (!productboardAccessToken) {
    console.error("Please set PRODUCTBOARD_ACCESS_TOKEN environment variable");
    process.exit(1);
}

const productboardClient = new ProductboardClient(process.env.PRODUCTBOARD_ACCESS_TOKEN!)
export default productboardClient
