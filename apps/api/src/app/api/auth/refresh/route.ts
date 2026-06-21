import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../../lib/api-helper";
import { User } from "@headless/database";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@headless/auth";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse("Refresh token is required", 400);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return errorResponse("Invalid or expired refresh token", 401);
    }

    const user = await User.findById(payload.userId);
    if (!user || user.status === "suspended" || user.isDeleted) {
      return errorResponse("User account unavailable", 401);
    }

    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    return successResponse(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      "Token refreshed successfully"
    );
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
