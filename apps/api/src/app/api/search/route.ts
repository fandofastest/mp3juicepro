import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../lib/api-helper";
import { ProviderFactory } from "@headless/providers";
import { AnalyticsEvent } from "@headless/database";
import { verifyAccessToken } from "@headless/auth";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const providerName = searchParams.get("provider") || "mock";

    if (!query) {
      return errorResponse("Search query is required", 400);
    }

    const provider = ProviderFactory.getProvider(providerName);
    const results = await provider.search(query, limit);

    // Track search event in analytics asynchronously
    const authHeader = req.headers.get("Authorization");
    let userId: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const payload = verifyAccessToken(authHeader.substring(7));
      if (payload) {
        userId = payload.userId;
      }
    }

    AnalyticsEvent.create({
      eventType: "Search",
      userId,
      metadata: { query, provider: providerName, resultCount: results.tracks.length },
    }).catch(err => console.error("Analytics error:", err));

    return successResponse(results);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
