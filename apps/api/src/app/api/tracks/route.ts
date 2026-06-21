import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { Track } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { artist: { $regex: query, $options: "i" } },
      ];
    }

    const total = await Track.countDocuments(filter);
    const tracks = await Track.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    return successResponse({
      tracks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const vid = searchParams.get("vid");

    if (!vid) {
      return errorResponse("Track YouTube video ID (vid) is required", 400);
    }

    const deletedTrack = await Track.findOneAndDelete({ vid });
    if (!deletedTrack) {
      return errorResponse("Track not found", 404);
    }

    return successResponse(deletedTrack, "Track deleted successfully from local database");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
