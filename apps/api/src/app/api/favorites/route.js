"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload) {
            return (0, api_helper_1.errorResponse)("Unauthorized", 401);
        }
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // song, album, artist, playlist
        const filter = { userId: userPayload.userId };
        if (type) {
            filter.type = type;
        }
        const favorites = await database_1.Favorite.find(filter).sort({ createdAt: -1 });
        return (0, api_helper_1.successResponse)(favorites);
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
        const { type, targetId } = body;
        if (!type || !targetId) {
            return (0, api_helper_1.errorResponse)("Type and Target ID are required", 400);
        }
        // Toggle favorite logic
        const existing = await database_1.Favorite.findOne({ userId: userPayload.userId, type, targetId });
        if (existing) {
            await database_1.Favorite.deleteOne({ _id: existing._id });
            return (0, api_helper_1.successResponse)({ favorited: false }, "Removed from favorites");
        }
        else {
            const fav = await database_1.Favorite.create({
                userId: userPayload.userId,
                type,
                targetId,
            });
            return (0, api_helper_1.successResponse)({ favorited: true, item: fav }, "Added to favorites", 201);
        }
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map