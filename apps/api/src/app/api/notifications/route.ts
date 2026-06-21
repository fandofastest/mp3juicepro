import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { Notification } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const notifications = await Notification.find({ enabled: true, isDeleted: false }).sort({ createdAt: -1 });
    return successResponse(notifications);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Moderator")) {
      return errorResponse("Unauthorized access", 403);
    }

    const body = await req.json();
    const { type, title, message, targetUrl, enabled } = body;

    if (!type || !title || !message) {
      return errorResponse("Type, title and message are required", 400);
    }

    const notification = await Notification.create({
      type,
      title,
      message,
      targetUrl,
      enabled: enabled !== undefined ? enabled : true,
    });

    return successResponse(notification, "Notification created successfully", 21);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Moderator")) {
      return errorResponse("Unauthorized access", 403);
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return errorResponse("Notification ID is required", 400);
    }

    const notification = await Notification.findById(id);
    if (!notification || notification.isDeleted) {
      return errorResponse("Notification not found", 404);
    }

    Object.assign(notification, data);
    await notification.save();

    return successResponse(notification, "Notification updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Moderator")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Notification ID is required", 400);
    }

    const notification = await Notification.findById(id);
    if (!notification || notification.isDeleted) {
      return errorResponse("Notification not found", 404);
    }

    notification.isDeleted = true;
    notification.deletedAt = new Date();
    await notification.save();

    return successResponse(null, "Notification deleted successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
