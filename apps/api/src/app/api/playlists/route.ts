import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { Playlist } from "@headless/database";
import { PlaylistInputSchema } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Filter public playlists, or private ones owned by the requester
    const filter: any = { isDeleted: false };

    if (userId) {
      filter.creatorId = userId;
      if (!userPayload || userPayload.userId !== userId) {
        filter.isPublic = true;
      }
    } else {
      filter.isPublic = true;
    }

    const playlists = await Playlist.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    return successResponse(playlists);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const parsed = PlaylistInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const playlist = await Playlist.create({
      ...parsed.data,
      slug: parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      creatorId: userPayload.userId,
      creatorName: userPayload.email.split("@")[0],
    });

    return successResponse(playlist, "Playlist created successfully", 21);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return errorResponse("Playlist ID is required", 400);
    }

    const playlist = await Playlist.findById(id);
    if (!playlist || playlist.isDeleted) {
      return errorResponse("Playlist not found", 404);
    }

    // Authorization check: Only creator or admin can update
    if (playlist.creatorId !== userPayload.userId && userPayload.role !== "Admin" && userPayload.role !== "Super Admin") {
      return errorResponse("Permission denied", 403);
    }

    Object.assign(playlist, data);
    if (data.title) {
      playlist.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    await playlist.save();

    return successResponse(playlist, "Playlist updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Playlist ID is required", 400);
    }

    const playlist = await Playlist.findById(id);
    if (!playlist || playlist.isDeleted) {
      return errorResponse("Playlist not found", 404);
    }

    if (playlist.creatorId !== userPayload.userId && userPayload.role !== "Admin" && userPayload.role !== "Super Admin") {
      return errorResponse("Permission denied", 403);
    }

    playlist.isDeleted = true;
    playlist.deletedAt = new Date();
    await playlist.save();

    return successResponse(null, "Playlist deleted successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
