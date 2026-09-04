"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const notifications = await database_1.Notification.find({ enabled: true, isDeleted: false }).sort({ createdAt: -1 });
        return (0, api_helper_1.successResponse)(notifications);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Moderator")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const body = await req.json();
        const { type, title, message, targetUrl, enabled } = body;
        if (!type || !title || !message) {
            return (0, api_helper_1.errorResponse)("Type, title and message are required", 400);
        }
        const notification = await database_1.Notification.create({
            type,
            title,
            message,
            targetUrl,
            enabled: enabled !== undefined ? enabled : true,
        });
        return (0, api_helper_1.successResponse)(notification, "Notification created successfully", 201);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function PUT(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Moderator")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const body = await req.json();
        const { id, ...data } = body;
        if (!id) {
            return (0, api_helper_1.errorResponse)("Notification ID is required", 400);
        }
        const notification = await database_1.Notification.findById(id);
        if (!notification || notification.isDeleted) {
            return (0, api_helper_1.errorResponse)("Notification not found", 404);
        }
        Object.assign(notification, data);
        await notification.save();
        return (0, api_helper_1.successResponse)(notification, "Notification updated successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function DELETE(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Moderator")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return (0, api_helper_1.errorResponse)("Notification ID is required", 400);
        }
        const notification = await database_1.Notification.findById(id);
        if (!notification || notification.isDeleted) {
            return (0, api_helper_1.errorResponse)("Notification not found", 404);
        }
        notification.isDeleted = true;
        notification.deletedAt = new Date();
        await notification.save();
        return (0, api_helper_1.successResponse)(null, "Notification deleted successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map