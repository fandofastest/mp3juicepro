import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { AnalyticsEvent } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Moderator")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: any = {};
    if (eventType) {
      filter.eventType = eventType;
    }

    const events = await AnalyticsEvent.find(filter).sort({ createdAt: -1 }).limit(limit);
    return successResponse(events);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req); // Optional for public actions like registration

    const body = await req.json();
    const { eventType, metadata } = body;

    if (!eventType) {
      return errorResponse("Event type is required", 400);
    }

    const event = await AnalyticsEvent.create({
      eventType,
      userId: userPayload?.userId || undefined,
      metadata: metadata || {},
    });

    return successResponse(event, "Event tracked successfully", 21);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
