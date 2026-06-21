import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { Category } from "@headless/database";
import { CategoryInputSchema } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const categories = await Category.find({ isDeleted: false }).sort({ sortOrder: 1 });
    return successResponse(categories);
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
    const parsed = CategoryInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const category = await Category.create(parsed.data);
    return successResponse(category, "Category created successfully", 21);
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
      return errorResponse("Category ID is required", 400);
    }

    const category = await Category.findById(id);
    if (!category || category.isDeleted) {
      return errorResponse("Category not found", 404);
    }

    Object.assign(category, data);
    await category.save();

    return successResponse(category, "Category updated successfully");
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
      return errorResponse("Category ID is required", 400);
    }

    const category = await Category.findById(id);
    if (!category || category.isDeleted) {
      return errorResponse("Category not found", 404);
    }

    category.isDeleted = true;
    category.deletedAt = new Date();
    await category.save();

    return successResponse(null, "Category soft deleted successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
