import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../lib/api-helper";
import { GENRES } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    // Return predefined genres.
    const genres = GENRES.map((g) => ({
      id: g.toLowerCase(),
      name: g,
      slug: g.toLowerCase(),
      enabled: true,
    }));
    return successResponse(genres);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
