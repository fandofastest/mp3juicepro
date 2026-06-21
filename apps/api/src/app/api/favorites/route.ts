import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { Favorite } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // song, album, artist, playlist

    const filter: any = { userId: userPayload.userId };
    if (type) {
      filter.type = type;
    }

    const favorites = await Favorite.find(filter).sort({ createdAt: -1 });
    return successResponse(favorites);
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
    const { type, targetId } = body;

    if (!type || !targetId) {
      return errorResponse("Type and Target ID are required", 400);
    }

    // Toggle favorite logic
    const existing = await Favorite.findOne({ userId: userPayload.userId, type, targetId });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return successResponse({ favorited: false }, "Removed from favorites");
    } else {
      const fav = await Favorite.create({
        userId: userPayload.userId,
        type,
        targetId,
      });
      return successResponse({ favorited: true, item: fav }, "Added to favorites", 21);
    }
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
