import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../../lib/api-helper";
import { User, AuditLog } from "@headless/database";
import { LoginInputSchema } from "@headless/types";
import { comparePassword, signAccessToken, signRefreshToken } from "@headless/auth";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const body = await req.json();

    // Validation
    const parsed = LoginInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const { email, password, rememberMe } = parsed.data;

    // Find User
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }

    if (user.status === "suspended") {
      return errorResponse("Account suspended. Contact support.", 403);
    }

    // Verify Password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse("Invalid credentials", 401);
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload, rememberMe);
    const refreshToken = signRefreshToken(payload, rememberMe);

    // Audit log
    await AuditLog.create({
      userId: user._id.toString(),
      action: "login",
      resource: "auth",
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    const userProfile = {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      premium: user.premium,
      verified: user.verified,
      country: user.country,
      language: user.language,
      theme: user.theme,
    };

    return successResponse(
      {
        user: userProfile,
        accessToken,
        refreshToken,
      },
      "Login successful"
    );
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
