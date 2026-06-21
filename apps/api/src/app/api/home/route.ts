import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { HomeSection, Category, Banner, Playlist, History, Favorite, SystemSettings } from "@headless/database";
import { ProviderFactory } from "@headless/providers";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);

    // Fetch enabled homepage sections
    const sections = await HomeSection.find({ enabled: true, isDeleted: false }).sort({ sortOrder: 1 });

    const populatedSections = await Promise.all(
      sections.map(async (sec: any) => {
        let items: any[] = [];
        const limit = sec.limit || 10;

        try {
          switch (sec.type) {
            case "banner":
              // Load active banners from local DB
              items = await Banner.find({ enabled: true, isDeleted: false }).sort({ sortOrder: 1 }).limit(limit);
              break;

            case "category":
              // Load active categories from local DB (filtered by query/keyword if provided)
              const catFilter: any = { enabled: true, isDeleted: false };
              if (sec.query) {
                catFilter.$or = [
                  { title: { $regex: sec.query, $options: "i" } },
                  { slug: { $regex: sec.query, $options: "i" } },
                ];
              }
              items = await Category.find(catFilter).sort({ sortOrder: 1 }).limit(limit);
              break;

            case "playlist":
              // Load public playlists from local DB
              items = await Playlist.find({ isPublic: true, isDeleted: false }).sort({ updatedAt: -1 }).limit(limit);
              break;

            case "featured":
            case "recommendation":
            case "search":
            case "manual":
              // 1. If section has explicitly assigned tracks, use them
              if (sec.tracks && sec.tracks.length > 0) {
                items = sec.tracks.slice(0, limit);
                break;
              }

              // 2. Otherwise query Music Provider
              const provider = ProviderFactory.getProvider(sec.provider || "mock");
              const queryStr = sec.query || "hits";

              // Dynamically inject YouTube API Key if using youtube provider
              if (sec.provider === "youtube") {
                try {
                  const settings = await SystemSettings.findOne();
                  const apiKey = settings?.apiKeys?.get("youtube_api_key");
                  if (apiKey && typeof (provider as any).setApiKey === "function") {
                    (provider as any).setApiKey(apiKey);
                  }
                } catch (e) {}
              }

              const results = await provider.search(queryStr, limit);
              items = results.tracks;

              // If using 'local' provider but results are insufficient, dynamically fetch from YouTube,
              // save to database, and append to the section tracks.
              if (sec.provider === "local" && items.length < limit) {
                try {
                  const settings = await SystemSettings.findOne();
                  const apiKey = settings?.apiKeys?.get("youtube_api_key");
                  if (apiKey) {
                    const ytProvider = ProviderFactory.getProvider("youtube") as any;
                    if (ytProvider && typeof ytProvider.setApiKey === "function") {
                      ytProvider.setApiKey(apiKey);
                    }
                    const ytResults = await ytProvider.search(queryStr, limit);
                    
                    const existingVids = new Set(items.map((t: any) => t.vid || t.id));
                    for (const t of ytResults.tracks) {
                      if (!existingVids.has(t.vid || t.id)) {
                        items.push(t);
                      }
                    }
                    items = items.slice(0, limit);
                  }
                } catch (err) {
                  console.warn("Failed to dynamically populate local section from YouTube:", err);
                }
              }

              // Persist the resolved tracks directly to the section if it is empty, so they are saved
              if (items.length > 0) {
                try {
                  sec.tracks = items;
                  await sec.save();
                } catch (err) {
                  console.error("Failed to save resolved tracks to home section:", err);
                }
              }
              break;

            case "history":
              // Load authenticated user's history
              if (userPayload) {
                items = await History.find({ userId: userPayload.userId }).sort({ playedAt: -1 }).limit(limit);
              }
              break;

            case "favorites":
              // Load authenticated user's favorite tracks
              if (userPayload) {
                items = await Favorite.find({ userId: userPayload.userId, type: "song" }).sort({ createdAt: -1 }).limit(limit);
              }
              break;

            default:
              items = [];
          }
        } catch (err) {
          console.error(`Error populating home section ${sec.title}:`, err);
        }

        return {
          id: sec._id,
          title: sec.title,
          subtitle: sec.subtitle,
          icon: sec.icon,
          cover: sec.cover,
          layout: sec.layout,
          type: sec.type,
          sortOrder: sec.sortOrder,
          items,
        };
      })
    );

    return successResponse(populatedSections);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
