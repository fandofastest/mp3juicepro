import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../../lib/api-helper";
import { User } from "@headless/database";
import { signAccessToken, signRefreshToken } from "@headless/auth";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const body = await req.json();
    const { token } = body; // Mock Google OAuth token

    if (!token) {
      return errorResponse("Google authorization token is required", 400);
    }

    // Mock Google validation: We extract email from token (assume it's email for simplicity)
    const email = token.includes("@") ? token : "googleuser@mp3juice.pro";
    const username = email.split("@")[0] + "_google";

    let user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

    if (!user) {
      user = await User.create({
        username: username.toLowerCase(),
        displayName: "Google User",
        email: email.toLowerCase(),
        passwordHash: "oauth_placeholder",
        role: "User",
        status: "active",
        verified: true,
        premium: false,
      });
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return successResponse({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        premium: user.premium,
        verified: user.verified,
      },
      accessToken,
      refreshToken,
    }, "Google login successful");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
