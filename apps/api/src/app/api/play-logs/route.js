"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Moderator")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const q = searchParams.get("q")?.trim();
        const packageName = searchParams.get("packageName")?.trim();
        const query = {};
        if (q) {
            query.$or = [
                { vid: { $regex: q, $options: "i" } },
                { title: { $regex: q, $options: "i" } },
                { playUrl: { $regex: q, $options: "i" } },
            ];
        }
        if (packageName) {
            query.packageName = packageName;
        }
        const total = await database_1.PlayLog.countDocuments(query);
        const skip = (page - 1) * limit;
        const rawLogs = await database_1.PlayLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const logs = rawLogs.map((log) => ({
            id: log._id.toString(),
            vid: log.vid,
            title: log.title || "YouTube Track",
            artist: log.artist || "YouTube Video",
            playUrl: log.playUrl,
            packageName: log.packageName || "Default App",
            userId: log.userId || null,
            ipAddress: log.ipAddress || "Unknown IP",
            userAgent: log.userAgent || "Unknown Client",
            createdAt: log.createdAt,
        }));
        // Calculate Summary Stats
        const totalHits = await database_1.PlayLog.countDocuments();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayHits = await database_1.PlayLog.countDocuments({ createdAt: { $gte: startOfToday } });
        const uniqueTracks = await database_1.PlayLog.distinct("vid");
        const uniqueApps = await database_1.PlayLog.distinct("packageName");
        return (0, api_helper_1.successResponse)({
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit) || 1,
            },
            summary: {
                totalHits,
                todayHits,
                uniqueTracksCount: uniqueTracks.length,
                uniqueAppsCount: uniqueApps.length,
            },
        });
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map