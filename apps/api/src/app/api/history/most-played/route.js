"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        // Aggregate History to calculate play counts per vid
        const mostPlayed = await database_1.History.aggregate([
            {
                $group: {
                    _id: "$vid",
                    playCount: { $sum: 1 },
                    title: { $first: "$title" },
                    artist: { $first: "$artist" },
                    album: { $first: "$album" },
                    cover: { $first: "$cover" },
                    duration: { $first: "$duration" },
                },
            },
            { $sort: { playCount: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    vid: "$_id",
                    playCount: 1,
                    title: 1,
                    artist: 1,
                    album: 1,
                    cover: 1,
                    duration: 1,
                },
            },
        ]);
        return (0, api_helper_1.successResponse)(mostPlayed, "Most played tracks loaded successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map