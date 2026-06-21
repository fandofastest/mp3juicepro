import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { History } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const history = await History.find({ userId: userPayload.userId }).sort({ playedAt: -1 }).limit(50);
    return successResponse(history);
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
    const { trackId, title, artist, album, cover, duration } = body;

    if (!trackId || !title || !artist || !cover || !duration) {
      return errorResponse("Missing required fields", 400);
    }

    const historyEntry = await History.create({
      userId: userPayload.userId,
      trackId,
      title,
      artist,
      album,
      cover,
      duration,
    });

    return successResponse(historyEntry, "Listening history logged", 21);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
