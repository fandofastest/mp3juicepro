import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { User } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const role = searchParams.get("role");
    const query = searchParams.get("q");

    const filter: any = { isDeleted: false };
    if (role) filter.role = role;
    if (query) {
      filter.$or = [
        { username: new RegExp(query, "i") },
        { displayName: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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
    const { userId, role, status, premium, verified } = body;

    if (!userId) {
      return errorResponse("User ID is required", 400);
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return errorResponse("User not found", 404);
    }

    // Role protection: Only Super Admin can change roles to Admin or Super Admin
    if (role && role !== user.role) {
      if ((role === "Admin" || role === "Super Admin" || user.role === "Super Admin") && userPayload.role !== "Super Admin") {
        return errorResponse("Only Super Admin can manage administrative roles", 403);
      }
      user.role = role;
    }

    if (status !== undefined) user.status = status;
    if (premium !== undefined) user.premium = premium;
    if (verified !== undefined) user.verified = verified;

    await user.save();

    return successResponse(user, "User updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Super Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return errorResponse("User ID is required", 400);
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return errorResponse("User not found", 404);
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    return successResponse(null, "User soft deleted successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
