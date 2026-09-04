"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
const types_1 = require("@headless/types");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const sections = await database_1.HomeSection.find({ isDeleted: false }).sort({ sortOrder: 1 });
        return (0, api_helper_1.successResponse)(sections);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const body = await req.json();
        const parsed = types_1.HomeSectionInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const section = await database_1.HomeSection.create(parsed.data);
        return (0, api_helper_1.successResponse)(section, "Home section created successfully", 201);
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
        const { id, ...data } = body;
        if (!id) {
            return (0, api_helper_1.errorResponse)("Section ID is required", 400);
        }
        const section = await database_1.HomeSection.findById(id);
        if (!section || section.isDeleted) {
            return (0, api_helper_1.errorResponse)("Section not found", 404);
        }
        Object.assign(section, data);
        await section.save();
        return (0, api_helper_1.successResponse)(section, "Home section updated successfully");
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
        const id = searchParams.get("id");
        if (!id) {
            return (0, api_helper_1.errorResponse)("Section ID is required", 400);
        }
        const section = await database_1.HomeSection.findById(id);
        if (!section || section.isDeleted) {
            return (0, api_helper_1.errorResponse)("Section not found", 404);
        }
        section.isDeleted = true;
        section.deletedAt = new Date();
        await section.save();
        return (0, api_helper_1.successResponse)(null, "Section deleted successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map