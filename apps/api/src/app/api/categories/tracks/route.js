"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
const providers_1 = require("@headless/providers");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const id = searchParams.get("id");
        const settings = await database_1.SystemSettings.findOne();
        const defaultLimit = settings?.searchLimit || 20;
        const limit = parseInt(searchParams.get("limit") || String(defaultLimit));
        if (!slug && !id) {
            return (0, api_helper_1.errorResponse)("Either category slug or id query parameter is required", 400);
        }
        // Find category
        const category = id
            ? await database_1.Category.findOne({ _id: id, isDeleted: false })
            : await database_1.Category.findOne({ slug, isDeleted: false });
        if (!category) {
            return (0, api_helper_1.errorResponse)("Category not found", 404);
        }
        const categoryTitle = category.title;
        // 1. If category has explicitly assigned tracks, use them
        let tracks = category.tracks || [];
        // 2. If no explicit tracks assigned, search local database & YouTube fallback
        if (tracks.length === 0) {
            // Find matching local tracks
            const localTracks = await database_1.Track.find({
                $or: [
                    { title: { $regex: categoryTitle, $options: "i" } },
                    { artist: { $regex: categoryTitle, $options: "i" } },
                ],
            }).limit(limit);
            tracks = localTracks.map((t) => ({
                id: t.vid,
                vid: t.vid,
                title: t.title,
                artist: t.artist,
                cover: t.cover,
                duration: t.duration,
                provider: t.provider || "local",
            }));
            // If still fewer than limit, fetch from YouTube API
            if (tracks.length < limit) {
                try {
                    const settings = await database_1.SystemSettings.findOne();
                    const apiKey = settings?.apiKeys?.get("youtube_api_key");
                    if (apiKey) {
                        const ytProvider = providers_1.ProviderFactory.getProvider("youtube");
                        if (ytProvider && typeof ytProvider.setApiKey === "function") {
                            ytProvider.setApiKey(apiKey);
                        }
                        const ytResults = await ytProvider.search(categoryTitle, limit);
                        const existingVids = new Set(tracks.map((t) => t.vid));
                        for (const t of ytResults.tracks) {
                            if (t.vid && !existingVids.has(t.vid)) {
                                tracks.push({
                                    id: t.vid,
                                    vid: t.vid,
                                    title: t.title,
                                    artist: t.artist,
                                    cover: t.cover,
                                    duration: t.duration,
                                    provider: "youtube",
                                });
                            }
                        }
                        tracks = tracks.slice(0, limit);
                    }
                }
                catch (err) {
                    console.warn(`Failed to dynamically fetch YouTube tracks for category ${categoryTitle}:`, err);
                }
            }
            // Persist the resolved tracks directly to the category so they are saved
            if (tracks.length > 0) {
                try {
                    category.tracks = tracks;
                    await category.save();
                }
                catch (err) {
                    console.error("Failed to save resolved tracks to category document:", err);
                }
            }
        }
        return (0, api_helper_1.successResponse)({
            category,
            tracks,
        });
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map