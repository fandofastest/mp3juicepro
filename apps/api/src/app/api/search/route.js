"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const api_helper_1 = require("../../../lib/api-helper");
const providers_1 = require("@headless/providers");
const database_1 = require("@headless/database");
const auth_1 = require("@headless/auth");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const limit = parseInt(searchParams.get("limit") || "10");
        const providerName = searchParams.get("provider") || "mock";
        if (!query) {
            return (0, api_helper_1.errorResponse)("Search query is required", 400);
        }
        const provider = providers_1.ProviderFactory.getProvider(providerName);
        // Dynamically inject YouTube API Key from Settings database
        if (providerName === "youtube") {
            const settings = await database_1.SystemSettings.findOne();
            if (settings && settings.apiKeys) {
                const apiKey = settings.apiKeys.get("youtube_api_key");
                if (apiKey && "setApiKey" in provider) {
                    provider.setApiKey(apiKey);
                }
            }
        }
        let results;
        try {
            results = await provider.search(query, limit);
        }
        catch (e) {
            console.error("Provider search failed, using fallback:", e);
            results = { tracks: [], albums: [], artists: [] };
        }
        if ((!results || !results.tracks || results.tracks.length === 0) && providerName === "youtube") {
            console.log("YouTube search returned 0 results. Falling back to Mock music provider.");
            const mockProvider = providers_1.ProviderFactory.getProvider("mock");
            results = await mockProvider.search(query, limit);
        }
        // Track search event in analytics asynchronously
        const authHeader = req.headers.get("Authorization");
        let userId;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const payload = (0, auth_1.verifyAccessToken)(authHeader.substring(7));
            if (payload) {
                userId = payload.userId;
            }
        }
        database_1.AnalyticsEvent.create({
            eventType: "Search",
            userId,
            metadata: { query, provider: providerName, resultCount: results.tracks.length },
        }).catch(err => console.error("Analytics error:", err));
        return (0, api_helper_1.successResponse)(results);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map