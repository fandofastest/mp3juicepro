"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
const providers_1 = require("@headless/providers");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload) {
            return (0, api_helper_1.errorResponse)("Unauthorized", 401);
        }
        const history = await database_1.History.find({ userId: userPayload.userId }).sort({ playedAt: -1 }).limit(50);
        return (0, api_helper_1.successResponse)(history);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload) {
            return (0, api_helper_1.errorResponse)("Unauthorized", 401);
        }
        const body = await req.json();
        const { trackId, vid } = body;
        const activeTrackId = trackId || vid;
        if (!activeTrackId) {
            return (0, api_helper_1.errorResponse)("YouTube video ID (trackId or vid) is required", 400);
        }
        // Default metadata placeholders
        let title = "YouTube Video";
        let artist = "Unknown Artist";
        let cover = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300";
        let duration = 240;
        // Resolve details using Google YouTube API
        try {
            const settings = await database_1.SystemSettings.findOne();
            const apiKey = settings?.apiKeys?.get("youtube_api_key");
            if (apiKey) {
                const yt = new providers_1.YoutubeMusicProvider(apiKey);
                const details = await yt.getTrack(activeTrackId);
                if (details) {
                    title = details.title;
                    artist = details.artist;
                    cover = details.cover;
                    duration = details.duration;
                }
            }
        }
        catch (err) {
            console.warn("Failed to fetch YouTube metadata, using placeholders:", err);
        }
        const historyEntry = await database_1.History.create({
            userId: userPayload.userId,
            vid: activeTrackId,
            trackId: activeTrackId,
            title,
            artist,
            cover,
            duration,
        });
        return (0, api_helper_1.successResponse)(historyEntry, "Listening history logged", 201);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map