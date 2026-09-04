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
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        // Filter public playlists, or private ones owned by the requester
        const filter = { isDeleted: false };
        if (userId) {
            filter.creatorId = userId;
            if (!userPayload || userPayload.userId !== userId) {
                filter.isPublic = true;
            }
        }
        else {
            filter.isPublic = true;
        }
        const playlists = await database_1.Playlist.find(filter).sort({ isPinned: -1, updatedAt: -1 });
        return (0, api_helper_1.successResponse)(playlists);
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
        const parsed = types_1.PlaylistInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const playlist = await database_1.Playlist.create({
            ...parsed.data,
            slug: parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            creatorId: userPayload.userId,
            creatorName: userPayload.email.split("@")[0],
        });
        return (0, api_helper_1.successResponse)(playlist, "Playlist created successfully", 201);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function PUT(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload) {
            return (0, api_helper_1.errorResponse)("Unauthorized", 401);
        }
        const body = await req.json();
        const { id, ...data } = body;
        if (!id) {
            return (0, api_helper_1.errorResponse)("Playlist ID is required", 400);
        }
        const playlist = await database_1.Playlist.findById(id);
        if (!playlist || playlist.isDeleted) {
            return (0, api_helper_1.errorResponse)("Playlist not found", 404);
        }
        // Authorization check: Only creator or admin can update
        if (playlist.creatorId !== userPayload.userId && userPayload.role !== "Admin" && userPayload.role !== "Super Admin") {
            return (0, api_helper_1.errorResponse)("Permission denied", 403);
        }
        Object.assign(playlist, data);
        if (data.title) {
            playlist.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }
        await playlist.save();
        return (0, api_helper_1.successResponse)(playlist, "Playlist updated successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function DELETE(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload) {
            return (0, api_helper_1.errorResponse)("Unauthorized", 401);
        }
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return (0, api_helper_1.errorResponse)("Playlist ID is required", 400);
        }
        const playlist = await database_1.Playlist.findById(id);
        if (!playlist || playlist.isDeleted) {
            return (0, api_helper_1.errorResponse)("Playlist not found", 404);
        }
        if (playlist.creatorId !== userPayload.userId && userPayload.role !== "Admin" && userPayload.role !== "Super Admin") {
            return (0, api_helper_1.errorResponse)("Permission denied", 403);
        }
        playlist.isDeleted = true;
        playlist.deletedAt = new Date();
        await playlist.save();
        return (0, api_helper_1.successResponse)(null, "Playlist deleted successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map