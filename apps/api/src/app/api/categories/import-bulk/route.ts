import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../../lib/api-helper";
import { Category, Track, SystemSettings } from "@headless/database";
import { ProviderFactory } from "@headless/providers";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Moderator")) {
      return errorResponse("Unauthorized access", 403);
    }

    const categories = await Category.find({ isDeleted: false, enabled: true });

    if (categories.length === 0) {
      return errorResponse("No active categories found to sync", 400);
    }

    const settings = await SystemSettings.findOne();
    const apiKey = settings?.apiKeys?.get("youtube_api_key");

    if (!apiKey) {
      return errorResponse("YouTube API Key is not configured in settings", 400);
    }

    const ytProvider = ProviderFactory.getProvider("youtube") as any;
    if (ytProvider && typeof ytProvider.setApiKey === "function") {
      ytProvider.setApiKey(apiKey);
    }

    let totalImported = 0;
    const summary: any[] = [];

    // Process categories sequentially to avoid rate limiting
    for (const category of categories) {
      try {
        const results = await ytProvider.search(category.title, 10); // fetch 10 songs per category
        const tracks = results.tracks;

        let importedCount = 0;
        for (const t of tracks) {
          if (!t.vid) continue;
          await Track.findOneAndUpdate(
            { vid: t.vid },
            {
              vid: t.vid,
              title: t.title,
              artist: t.artist,
              cover: t.cover,
              duration: t.duration,
              provider: "youtube",
            },
            { upsert: true }
          );
          importedCount++;
        }

        totalImported += importedCount;
        summary.push({
          category: category.title,
          imported: importedCount,
        });
      } catch (err: any) {
        console.error(`Failed to bulk import tracks for category ${category.title}:`, err);
        summary.push({
          category: category.title,
          error: err.message || "Failed to fetch/save",
        });
      }
    }

    return successResponse({
      totalCategories: categories.length,
      totalImported,
      details: summary,
    }, "Bulk category sync completed successfully.");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
