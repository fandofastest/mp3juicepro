import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../../lib/api-helper";
import { User } from "@headless/database";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    user.verified = true;
    await user.save();

    return successResponse({ verified: true }, "Email verified successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
