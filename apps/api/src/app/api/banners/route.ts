import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { Banner } from "@headless/database";
import { BannerInputSchema } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const banners = await Banner.find({ isDeleted: false }).sort({ sortOrder: 1 });
    return successResponse(banners);
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
    const parsed = BannerInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const banner = await Banner.create(parsed.data);
    return successResponse(banner, "Banner created successfully", 201);
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
      return errorResponse("Banner ID is required", 400);
    }

    const banner = await Banner.findById(id);
    if (!banner || banner.isDeleted) {
      return errorResponse("Banner not found", 404);
    }

    Object.assign(banner, data);
    await banner.save();

    return successResponse(banner, "Banner updated successfully");
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
      return errorResponse("Banner ID is required", 400);
    }

    const banner = await Banner.findById(id);
    if (!banner || banner.isDeleted) {
      return errorResponse("Banner not found", 404);
    }

    banner.isDeleted = true;
    banner.deletedAt = new Date();
    await banner.save();

    return successResponse(null, "Banner soft deleted successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
