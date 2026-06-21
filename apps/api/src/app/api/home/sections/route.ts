import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../../lib/api-helper";
import { HomeSection } from "@headless/database";
import { HomeSectionInputSchema } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const sections = await HomeSection.find({ isDeleted: false }).sort({ sortOrder: 1 });
    return successResponse(sections);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const body = await req.json();
    const parsed = HomeSectionInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const section = await HomeSection.create(parsed.data);
    return successResponse(section, "Home section created successfully", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return errorResponse("Section ID is required", 400);
    }

    const section = await HomeSection.findById(id);
    if (!section || section.isDeleted) {
      return errorResponse("Section not found", 404);
    }

    Object.assign(section, data);
    await section.save();

    return successResponse(section, "Home section updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Section ID is required", 400);
    }

    const section = await HomeSection.findById(id);
    if (!section || section.isDeleted) {
      return errorResponse("Section not found", 404);
    }

    section.isDeleted = true;
    section.deletedAt = new Date();
    await section.save();

    return successResponse(null, "Section deleted successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
