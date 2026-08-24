import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { PlayLog } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Moderator")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const q = searchParams.get("q")?.trim();
    const packageName = searchParams.get("packageName")?.trim();

    const query: any = {};

    if (q) {
      query.$or = [
        { vid: { $regex: q, $options: "i" } },
        { title: { $regex: q, $options: "i" } },
        { playUrl: { $regex: q, $options: "i" } },
      ];
    }

    if (packageName) {
      query.packageName = packageName;
    }

    const total = await PlayLog.countDocuments(query);
    const skip = (page - 1) * limit;

    const rawLogs = await PlayLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const logs = rawLogs.map((log) => ({
      id: log._id.toString(),
      vid: log.vid,
      title: log.title || "YouTube Track",
      artist: log.artist || "YouTube Video",
      playUrl: log.playUrl,
      packageName: log.packageName || "Default App",
      userId: log.userId || null,
      ipAddress: log.ipAddress || "Unknown IP",
      userAgent: log.userAgent || "Unknown Client",
      createdAt: log.createdAt,
    }));

    // Calculate Summary Stats
    const totalHits = await PlayLog.countDocuments();
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayHits = await PlayLog.countDocuments({ createdAt: { $gte: startOfToday } });

    const uniqueTracks = await PlayLog.distinct("vid");
    const uniqueApps = await PlayLog.distinct("packageName");

    return successResponse({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalHits,
        todayHits,
        uniqueTracksCount: uniqueTracks.length,
        uniqueAppsCount: uniqueApps.length,
      },
    });
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
