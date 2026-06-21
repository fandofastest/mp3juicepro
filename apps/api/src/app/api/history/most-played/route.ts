import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../../lib/api-helper";
import { History } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Aggregate History to calculate play counts per vid
    const mostPlayed = await History.aggregate([
      {
        $group: {
          _id: "$vid",
          playCount: { $sum: 1 },
          title: { $first: "$title" },
          artist: { $first: "$artist" },
          album: { $first: "$album" },
          cover: { $first: "$cover" },
          duration: { $first: "$duration" },
        },
      },
      { $sort: { playCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: "$_id",
          vid: "$_id",
          playCount: 1,
          title: 1,
          artist: 1,
          album: 1,
          cover: 1,
          duration: 1,
        },
      },
    ]);

    return successResponse(mostPlayed, "Most played tracks loaded successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
