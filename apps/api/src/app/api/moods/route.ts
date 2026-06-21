import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../lib/api-helper";
import { MOODS } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const moods = MOODS.map((m) => ({
      id: m.toLowerCase(),
      name: m,
      slug: m.toLowerCase(),
      enabled: true,
    }));
    return successResponse(moods);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
