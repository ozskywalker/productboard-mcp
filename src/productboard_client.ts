class ProductboardClient {
    private accessToken: string
    private baseUrl = "https://api.productboard.com/v2"
    private headers: { [key: string]: string };

    constructor(accessToken: string) {
        this.accessToken = accessToken
        this.headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
    }

    async get(endpoint: string) {
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

        if (!response.ok) {
            const body = await response.text()
            throw new Error(`Productboard API error ${response.status}: ${body}`)
        }

        return response.json()
    }
}

const productboardAccessToken = process.env.PRODUCTBOARD_ACCESS_TOKEN

if (!productboardAccessToken) {
    console.error("Please set PRODUCTBOARD_ACCESS_TOKEN environment variable");
    process.exit(1);
}

const productboardClient = new ProductboardClient(process.env.PRODUCTBOARD_ACCESS_TOKEN!)
export default productboardClient
