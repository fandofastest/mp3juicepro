"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
const types_1 = require("@headless/types");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const categories = await database_1.Category.find({ isDeleted: false }).sort({ sortOrder: 1 });
        return (0, api_helper_1.successResponse)(categories);
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
        const parsed = types_1.CategoryInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const category = await database_1.Category.create(parsed.data);
        return (0, api_helper_1.successResponse)(category, "Category created successfully", 201);
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
            return (0, api_helper_1.errorResponse)("Category ID is required", 400);
        }
        const category = await database_1.Category.findById(id);
        if (!category || category.isDeleted) {
            return (0, api_helper_1.errorResponse)("Category not found", 404);
        }
        Object.assign(category, data);
        await category.save();
        return (0, api_helper_1.successResponse)(category, "Category updated successfully");
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
            return (0, api_helper_1.errorResponse)("Category ID is required", 400);
        }
        const category = await database_1.Category.findById(id);
        if (!category || category.isDeleted) {
            return (0, api_helper_1.errorResponse)("Category not found", 404);
        }
        category.isDeleted = true;
        category.deletedAt = new Date();
        await category.save();
        return (0, api_helper_1.successResponse)(null, "Category soft deleted successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map