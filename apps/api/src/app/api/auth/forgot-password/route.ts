import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../../lib/api-helper";
import { User } from "@headless/database";
import { ForgotPasswordInputSchema } from "@headless/types";
import { Logger } from "@headless/utils";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const body = await req.json();

    const parsed = ForgotPasswordInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const { email } = parsed.data;
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

    if (!user) {
      // Return success even if user not found to prevent user enumeration
      return successResponse(null, "If the email is registered, you will receive a reset link shortly.");
    }

    // Generate a temporary mock reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    Logger.info(`[MOCK EMAIL] Password reset token for ${email}: ${resetToken}`);
    Logger.info(`[MOCK EMAIL] Reset Link: http://localhost:3000/auth/reset-password?token=${resetToken}`);

    // In a real system, you'd store this in Redis or DB and mail it.
    // For this CMS, we return the token in mock mode to make testing easy:
    return successResponse({ token: resetToken }, "Password reset link generated.");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
