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
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const body = await req.json();
        const { query, limit } = body;
        if (!query) {
            return (0, api_helper_1.errorResponse)("Search query keyword is required", 400);
        }
        const settings = await database_1.SystemSettings.findOne();
        const apiKey = settings?.apiKeys?.get("youtube_api_key");
        if (!apiKey) {
            return (0, api_helper_1.errorResponse)("YouTube API Key is not configured in settings.", 400);
        }
        const ytProvider = new providers_1.YoutubeMusicProvider(apiKey);
        const searchResult = await ytProvider.search(query, limit || 20);
        const tracks = searchResult.tracks;
        if (tracks.length === 0) {
            return (0, api_helper_1.successResponse)([], "No tracks found on YouTube for this keyword.");
        }
        // Save/upsert tracks to local database
        const savedTracks = await Promise.all(tracks.map(async (t) => {
            if (!t.vid)
                return null;
            return database_1.Track.findOneAndUpdate({ vid: t.vid }, {
                vid: t.vid,
                title: t.title,
                artist: t.artist,
                cover: t.cover,
                duration: t.duration,
                provider: "youtube",
            }, { upsert: true, new: true });
        }));
        const importedTracks = savedTracks.filter(Boolean);
        return (0, api_helper_1.successResponse)(importedTracks, `Successfully imported ${importedTracks.length} tracks to local database.`);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map