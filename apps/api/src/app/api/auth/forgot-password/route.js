"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
const types_1 = require("@headless/types");
const utils_1 = require("@headless/utils");
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const body = await req.json();
        const parsed = types_1.ForgotPasswordInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const { email } = parsed.data;
        const user = await database_1.User.findOne({ email: email.toLowerCase(), isDeleted: false });
        if (!user) {
            // Return success even if user not found to prevent user enumeration
            return (0, api_helper_1.successResponse)(null, "If the email is registered, you will receive a reset link shortly.");
        }
        // Generate a temporary mock reset token
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        utils_1.Logger.info(`[MOCK EMAIL] Password reset token for ${email}: ${resetToken}`);
        utils_1.Logger.info(`[MOCK EMAIL] Reset Link: http://localhost:3000/auth/reset-password?token=${resetToken}`);
        // In a real system, you'd store this in Redis or DB and mail it.
        // For this CMS, we return the token in mock mode to make testing easy:
        return (0, api_helper_1.successResponse)({ token: resetToken }, "Password reset link generated.");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map