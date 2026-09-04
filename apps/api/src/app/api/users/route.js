"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const role = searchParams.get("role");
        const query = searchParams.get("q");
        const filter = { isDeleted: false };
        if (role)
            filter.role = role;
        if (query) {
            filter.$or = [
                { username: new RegExp(query, "i") },
                { displayName: new RegExp(query, "i") },
                { email: new RegExp(query, "i") },
            ];
        }
        const skip = (page - 1) * limit;
        const users = await database_1.User.find(filter)
            .select("-passwordHash")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await database_1.User.countDocuments(filter);
        return (0, api_helper_1.successResponse)({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function PUT(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const body = await req.json();
        const { userId, role, status, premium, verified } = body;
        if (!userId) {
            return (0, api_helper_1.errorResponse)("User ID is required", 400);
        }
        const user = await database_1.User.findById(userId);
        if (!user || user.isDeleted) {
            return (0, api_helper_1.errorResponse)("User not found", 404);
        }
        // Role protection: Only Super Admin can change roles to Admin or Super Admin
        if (role && role !== user.role) {
            if ((role === "Admin" || role === "Super Admin" || user.role === "Super Admin") && userPayload.role !== "Super Admin") {
                return (0, api_helper_1.errorResponse)("Only Super Admin can manage administrative roles", 403);
            }
            user.role = role;
        }
        if (status !== undefined)
            user.status = status;
        if (premium !== undefined)
            user.premium = premium;
        if (verified !== undefined)
            user.verified = verified;
        await user.save();
        return (0, api_helper_1.successResponse)(user, "User updated successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function DELETE(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Super Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");
        if (!userId) {
            return (0, api_helper_1.errorResponse)("User ID is required", 400);
        }
        const user = await database_1.User.findById(userId);
        if (!user || user.isDeleted) {
            return (0, api_helper_1.errorResponse)("User not found", 404);
        }
        user.isDeleted = true;
        user.deletedAt = new Date();
        await user.save();
        return (0, api_helper_1.successResponse)(null, "User soft deleted successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map