import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../../lib/api-helper";
import { Category, Track, SystemSettings } from "@headless/database";
import { ProviderFactory } from "@headless/providers";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    const settings = await SystemSettings.findOne();
    const defaultLimit = settings?.searchLimit || 20;
    const limit = parseInt(searchParams.get("limit") || String(defaultLimit));

    if (!slug && !id) {
      return errorResponse("Either category slug or id query parameter is required", 400);
    }

    // Find category
    const category = id 
      ? await Category.findOne({ _id: id, isDeleted: false })
      : await Category.findOne({ slug, isDeleted: false });

    if (!category) {
      return errorResponse("Category not found", 404);
    }

    const categoryTitle = category.title;

    // 1. If category has explicitly assigned tracks, use them
    let tracks = category.tracks || [];

    // 2. If no explicit tracks assigned, search local database & YouTube fallback
    if (tracks.length === 0) {
      // Find matching local tracks
      const localTracks = await Track.find({
        $or: [
          { title: { $regex: categoryTitle, $options: "i" } },
          { artist: { $regex: categoryTitle, $options: "i" } },
        ],
      }).limit(limit);

      tracks = localTracks.map((t: any) => ({
        id: t.vid,
        vid: t.vid,
        title: t.title,
        artist: t.artist,
        cover: t.cover,
        duration: t.duration,
        provider: t.provider || "local",
      }));

      // If still fewer than limit, fetch from YouTube API
      if (tracks.length < limit) {
        try {
          const settings = await SystemSettings.findOne();
          const apiKey = settings?.apiKeys?.get("youtube_api_key");
          if (apiKey) {
            const ytProvider = ProviderFactory.getProvider("youtube") as any;
            if (ytProvider && typeof ytProvider.setApiKey === "function") {
              ytProvider.setApiKey(apiKey);
            }
            const ytResults = await ytProvider.search(categoryTitle, limit);
            
            const existingVids = new Set(tracks.map((t: any) => t.vid));
            for (const t of ytResults.tracks) {
              if (t.vid && !existingVids.has(t.vid)) {
                tracks.push({
                  id: t.vid,
                  vid: t.vid,
                  title: t.title,
                  artist: t.artist,
                  cover: t.cover,
                  duration: t.duration,
                  provider: "youtube",
                });
              }
            }
            tracks = tracks.slice(0, limit);
          }
        } catch (err) {
          console.warn(`Failed to dynamically fetch YouTube tracks for category ${categoryTitle}:`, err);
        }
      }

      // Persist the resolved tracks directly to the category so they are saved
      if (tracks.length > 0) {
        try {
          category.tracks = tracks;
          await category.save();
        } catch (err) {
          console.error("Failed to save resolved tracks to category document:", err);
        }
      }
    }

    return successResponse({
      category,
      tracks,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
