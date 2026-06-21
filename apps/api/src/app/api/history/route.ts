import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { History, SystemSettings } from "@headless/database";
import { YoutubeMusicProvider } from "@headless/providers";

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
    const { trackId, vid } = body;
    const activeTrackId = trackId || vid;

    if (!activeTrackId) {
      return errorResponse("YouTube video ID (trackId or vid) is required", 400);
    }

    // Default metadata placeholders
    let title = "YouTube Video";
    let artist = "Unknown Artist";
    let cover = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300";
    let duration = 240;

    // Resolve details using Google YouTube API
    try {
      const settings = await SystemSettings.findOne();
      const apiKey = settings?.apiKeys?.get("youtube_api_key");
      
      if (apiKey) {
        const yt = new YoutubeMusicProvider(apiKey);
        const details = await yt.getTrack(activeTrackId);
        if (details) {
          title = details.title;
          artist = details.artist;
          cover = details.cover;
          duration = details.duration;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch YouTube metadata, using placeholders:", err);
    }

    const historyEntry = await History.create({
      userId: userPayload.userId,
      vid: activeTrackId,
      trackId: activeTrackId,
      title,
      artist,
      cover,
      duration,
    });

    return successResponse(historyEntry, "Listening history logged", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
