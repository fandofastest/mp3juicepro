import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../lib/api-helper";
import { User } from "@headless/database";
import { UpdateProfileInputSchema } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const user = await User.findById(userPayload.userId).select("-passwordHash");
    if (!user || user.isDeleted) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const parsed = UpdateProfileInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const user = await User.findById(userPayload.userId);
    if (!user || user.isDeleted) {
      return errorResponse("User not found", 404);
    }

    const data = parsed.data;
    if (data.displayName !== undefined) user.displayName = data.displayName;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    if (data.country !== undefined) user.country = data.country;
    if (data.language !== undefined) user.language = data.language;
    if (data.theme !== undefined) user.theme = data.theme;

    await user.save();

    const updatedProfile = await User.findById(userPayload.userId).select("-passwordHash");
    return successResponse(updatedProfile, "Profile updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
