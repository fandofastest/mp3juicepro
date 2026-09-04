"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
const providers_1 = require("@headless/providers");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        // Fetch enabled homepage sections
        const sections = await database_1.HomeSection.find({ enabled: true, isDeleted: false }).sort({ sortOrder: 1 });
        const populatedSections = await Promise.all(sections.map(async (sec) => {
            let items = [];
            const limit = sec.limit || 10;
            try {
                switch (sec.type) {
                    case "banner":
                        // Load active banners from local DB
                        items = await database_1.Banner.find({ enabled: true, isDeleted: false }).sort({ sortOrder: 1 }).limit(limit);
                        break;
                    case "category":
                        // Load active categories from local DB (filtered by query/keyword if provided)
                        const catFilter = { enabled: true, isDeleted: false };
                        if (sec.query) {
                            catFilter.$or = [
                                { title: { $regex: sec.query, $options: "i" } },
                                { slug: { $regex: sec.query, $options: "i" } },
                            ];
                        }
                        items = await database_1.Category.find(catFilter).sort({ sortOrder: 1 }).limit(limit);
                        break;
                    case "playlist":
                        // Load public playlists from local DB
                        items = await database_1.Playlist.find({ isPublic: true, isDeleted: false }).sort({ updatedAt: -1 }).limit(limit);
                        break;
                    case "featured":
                    case "recommendation":
                    case "search":
                    case "manual":
                        // 1. If section has explicitly assigned tracks, use them
                        if (sec.tracks && sec.tracks.length > 0) {
                            items = sec.tracks.slice(0, limit);
                            break;
                        }
                        // 2. Otherwise query Music Provider
                        const provider = providers_1.ProviderFactory.getProvider(sec.provider || "mock");
                        const queryStr = sec.query || "hits";
                        // Dynamically inject YouTube API Key if using youtube provider
                        if (sec.provider === "youtube") {
                            try {
                                const settings = await database_1.SystemSettings.findOne();
                                const apiKey = settings?.apiKeys?.get("youtube_api_key");
                                if (apiKey && typeof provider.setApiKey === "function") {
                                    provider.setApiKey(apiKey);
                                }
                            }
                            catch (e) { }
                        }
                        const results = await provider.search(queryStr, limit);
                        items = results.tracks;
                        // If using 'local' provider but results are insufficient, dynamically fetch from YouTube,
                        // save to database, and append to the section tracks.
                        if (sec.provider === "local" && items.length < limit) {
                            try {
                                const settings = await database_1.SystemSettings.findOne();
                                const apiKey = settings?.apiKeys?.get("youtube_api_key");
                                if (apiKey) {
                                    const ytProvider = providers_1.ProviderFactory.getProvider("youtube");
                                    if (ytProvider && typeof ytProvider.setApiKey === "function") {
                                        ytProvider.setApiKey(apiKey);
                                    }
                                    const ytResults = await ytProvider.search(queryStr, limit);
                                    const existingVids = new Set(items.map((t) => t.vid || t.id));
                                    for (const t of ytResults.tracks) {
                                        if (!existingVids.has(t.vid || t.id)) {
                                            items.push(t);
                                        }
                                    }
                                    items = items.slice(0, limit);
                                }
                            }
                            catch (err) {
                                console.warn("Failed to dynamically populate local section from YouTube:", err);
                            }
                        }
                        // Persist the resolved tracks directly to the section if it is empty, so they are saved
                        if (items.length > 0) {
                            try {
                                sec.tracks = items;
                                await sec.save();
                            }
                            catch (err) {
                                console.error("Failed to save resolved tracks to home section:", err);
                            }
                        }
                        break;
                    case "history":
                        // Load authenticated user's history
                        if (userPayload) {
                            items = await database_1.History.find({ userId: userPayload.userId }).sort({ playedAt: -1 }).limit(limit);
                        }
                        break;
                    case "favorites":
                        // Load authenticated user's favorite tracks
                        if (userPayload) {
                            items = await database_1.Favorite.find({ userId: userPayload.userId, type: "song" }).sort({ createdAt: -1 }).limit(limit);
                        }
                        break;
                    default:
                        items = [];
                }
            }
            catch (err) {
                console.error(`Error populating home section ${sec.title}:`, err);
            }
            return {
                id: sec._id,
                title: sec.title,
                subtitle: sec.subtitle,
                icon: sec.icon,
                cover: sec.cover,
                layout: sec.layout,
                type: sec.type,
                sortOrder: sec.sortOrder,
                items,
            };
        }));
        return (0, api_helper_1.successResponse)(populatedSections);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map