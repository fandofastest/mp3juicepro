import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { SystemSettings, History, AnalyticsEvent, Track, AppConfig } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    
    // Optional/Required authentication. Let's authenticate if token is present,
    // and require it if we want to write history.
    const userPayload = await authenticateRequest(req);
    const userId = userPayload?.userId;

    const { searchParams } = new URL(req.url);
    const vid = searchParams.get("vid");

    if (!vid) {
      return errorResponse("YouTube video ID (vid) query parameter is required", 400);
    }

    // Check Safe Mode configuration
    const packageName = req.headers.get("x-package-name") || searchParams.get("packageName");
    if (packageName) {
      const appConfig = await AppConfig.findOne({ packageName });
      if (appConfig && appConfig.safeMode) {
        return errorResponse("Song playback is disabled (Safe Mode Active)", 403);
      }
    }

    // Retrieve settings to get the configured RapidAPI Key
    const settings = await SystemSettings.findOne();
    const apiKey = settings?.apiKeys?.get("youtube_mp3_rapidapi_key") || process.env.RAPIDAPI_KEY;

    if (!apiKey) {
      return errorResponse("RapidAPI integration is not configured. Please set the API key in settings.", 500);
    }

    // Hit RapidAPI YouTube MP3 service
    const response = await fetch(
      `https://youtube-mp36.p.rapidapi.com/dl?id=${vid}`,
      {
        headers: {
          "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return errorResponse(`Downloader API error: ${errText || response.statusText}`, response.status);
    }

    const data = await response.json();

    if (data.status !== "ok" && data.msg !== "success" && !data.link) {
      return errorResponse(data.msg || "Failed to retrieve download link from RapidAPI", 400);
    }

    // Log Analytics Play Event
    AnalyticsEvent.create({
      eventType: "Play Event",
      userId,
      metadata: {
        vid,
        title: data.title || "Unknown Title",
        duration: data.duration || 0,
        filesize: data.filesize || 0,
        provider: "youtube",
      },
    }).catch(err => console.error("Analytics play logging failed:", err));

    // Automatically save track to local database Track cache
    try {
      await Track.findOneAndUpdate(
        { vid },
        {
          vid,
          title: data.title || "YouTube Track",
          artist: "YouTube Video",
          cover: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
          duration: Math.round(data.duration || 240),
          provider: "youtube",
        },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to save track to local collection in play endpoint:", err);
    }

    // If authenticated, automatically write to user's Listening History as well
    if (userId) {
      try {
        await History.create({
          userId,
          vid,
          trackId: vid,
          title: data.title || "YouTube Track",
          artist: "YouTube Video",
          cover: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
          duration: Math.round(data.duration || 240),
        });
      } catch (err) {
        console.error("Listening history log failed in play endpoint:", err);
      }
    }

    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
