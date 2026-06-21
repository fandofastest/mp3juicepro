import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { HomeSection, Category, Banner, Playlist, History, Favorite } from "@headless/database";
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
              // Load active categories from local DB
              items = await Category.find({ enabled: true, isDeleted: false }).sort({ sortOrder: 1 }).limit(limit);
              break;

            case "playlist":
              // Load public playlists from local DB
              items = await Playlist.find({ isPublic: true, isDeleted: false }).sort({ updatedAt: -1 }).limit(limit);
              break;

            case "featured":
            case "recommendation":
            case "search":
              // Query Music Provider
              const provider = ProviderFactory.getProvider(sec.provider || "mock");
              const queryStr = sec.query || "hits";
              const results = await provider.search(queryStr, limit);
              items = results.tracks;
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
