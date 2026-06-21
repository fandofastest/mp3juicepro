import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../../lib/api-helper";
import { SystemSettings, Track } from "@headless/database";
import { YoutubeMusicProvider } from "@headless/providers";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const body = await req.json();
    const { query, limit } = body;

    if (!query) {
      return errorResponse("Search query keyword is required", 400);
    }

    const settings = await SystemSettings.findOne();
    const apiKey = settings?.apiKeys?.get("youtube_api_key");

    if (!apiKey) {
      return errorResponse("YouTube API Key is not configured in settings.", 400);
    }

    const ytProvider = new YoutubeMusicProvider(apiKey);
    const searchResult = await ytProvider.search(query, limit || 20);
    const tracks = searchResult.tracks;

    if (tracks.length === 0) {
      return successResponse([], "No tracks found on YouTube for this keyword.");
    }

    // Save/upsert tracks to local database
    const savedTracks = await Promise.all(
      tracks.map(async (t) => {
        if (!t.vid) return null;
        return Track.findOneAndUpdate(
          { vid: t.vid },
          {
            vid: t.vid,
            title: t.title,
            artist: t.artist,
            cover: t.cover,
            duration: t.duration,
            provider: "youtube",
          },
          { upsert: true, new: true }
        );
      })
    );

    const importedTracks = savedTracks.filter(Boolean);

    return successResponse(
      importedTracks,
      `Successfully imported ${importedTracks.length} tracks to local database.`
    );
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
