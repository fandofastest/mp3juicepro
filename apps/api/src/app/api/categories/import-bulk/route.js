"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
const providers_1 = require("@headless/providers");
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Moderator")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const categories = await database_1.Category.find({ isDeleted: false, enabled: true });
        if (categories.length === 0) {
            return (0, api_helper_1.errorResponse)("No active categories found to sync", 400);
        }
        const settings = await database_1.SystemSettings.findOne();
        const apiKey = settings?.apiKeys?.get("youtube_api_key");
        if (!apiKey) {
            return (0, api_helper_1.errorResponse)("YouTube API Key is not configured in settings", 400);
        }
        const ytProvider = providers_1.ProviderFactory.getProvider("youtube");
        if (ytProvider && typeof ytProvider.setApiKey === "function") {
            ytProvider.setApiKey(apiKey);
        }
        let totalImported = 0;
        const summary = [];
        // Process categories sequentially to avoid rate limiting
        for (const category of categories) {
            try {
                const results = await ytProvider.search(category.title, 10); // fetch 10 songs per category
                const tracks = results.tracks;
                let importedCount = 0;
                for (const t of tracks) {
                    if (!t.vid)
                        continue;
                    await database_1.Track.findOneAndUpdate({ vid: t.vid }, {
                        vid: t.vid,
                        title: t.title,
                        artist: t.artist,
                        cover: t.cover,
                        duration: t.duration,
                        provider: "youtube",
                    }, { upsert: true });
                    importedCount++;
                }
                totalImported += importedCount;
                summary.push({
                    category: category.title,
                    imported: importedCount,
                });
            }
            catch (err) {
                console.error(`Failed to bulk import tracks for category ${category.title}:`, err);
                summary.push({
                    category: category.title,
                    error: err.message || "Failed to fetch/save",
                });
            }
        }
        return (0, api_helper_1.successResponse)({
            totalCategories: categories.length,
            totalImported,
            details: summary,
        }, "Bulk category sync completed successfully.");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map