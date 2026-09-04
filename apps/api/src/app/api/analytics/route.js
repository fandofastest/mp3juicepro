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
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Moderator")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const { searchParams } = new URL(req.url);
        const eventType = searchParams.get("eventType");
        const limit = parseInt(searchParams.get("limit") || "50");
        const filter = {};
        if (eventType) {
            filter.eventType = eventType;
        }
        const events = await database_1.AnalyticsEvent.find(filter).sort({ createdAt: -1 }).limit(limit);
        return (0, api_helper_1.successResponse)(events);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req); // Optional for public actions like registration
        const body = await req.json();
        const { eventType, metadata } = body;
        if (!eventType) {
            return (0, api_helper_1.errorResponse)("Event type is required", 400);
        }
        const event = await database_1.AnalyticsEvent.create({
            eventType,
            userId: userPayload?.userId || undefined,
            metadata: metadata || {},
        });
        return (0, api_helper_1.successResponse)(event, "Event tracked successfully", 201);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map