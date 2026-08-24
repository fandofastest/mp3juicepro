import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { SystemSettings, History, AnalyticsEvent, Track, AppConfig, PlayLog } from "@headless/database";

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

    // Retrieve settings to get configured Play API URL, fallback to lovelywombat service
    const settings = await SystemSettings.findOne();
    const baseUrl = settings?.apiKeys?.get("play_api_url") || process.env.PLAY_API_URL || "https://ytdl.lovelywombat.box.ca/dl";
    const downloadLink = `${baseUrl.replace(/\/+$/, '')}/${vid}`;

    const data = {
      status: "ok",
      link: downloadLink,
      vid,
      title: searchParams.get("title") || "YouTube Track",
      duration: 0,
      filesize: 0,
    };

    // Log Play Hit in PlayLog (resource details, IP, package name, user)
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    PlayLog.create({
      vid,
      title: data.title,
      artist: "YouTube Video",
      playUrl: downloadLink,
      packageName: packageName || undefined,
      userId: userId || undefined,
      ipAddress,
      userAgent,
    }).catch((err: any) => console.error("PlayLog logging failed:", err));

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
    }).catch((err: any) => console.error("Analytics play logging failed:", err));

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
