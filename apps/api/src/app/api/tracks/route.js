"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.DELETE = DELETE;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;
        const filter = {};
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: "i" } },
                { artist: { $regex: query, $options: "i" } },
            ];
        }
        const total = await database_1.Track.countDocuments(filter);
        const tracks = await database_1.Track.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return (0, api_helper_1.successResponse)({
            tracks,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function DELETE(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const { searchParams } = new URL(req.url);
        const vid = searchParams.get("vid");
        if (!vid) {
            return (0, api_helper_1.errorResponse)("Track YouTube video ID (vid) is required", 400);
        }
        const deletedTrack = await database_1.Track.findOneAndDelete({ vid });
        if (!deletedTrack) {
            return (0, api_helper_1.errorResponse)("Track not found", 404);
        }
        return (0, api_helper_1.successResponse)(deletedTrack, "Track deleted successfully from local database");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map