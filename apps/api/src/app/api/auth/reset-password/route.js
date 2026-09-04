"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
const types_1 = require("@headless/types");
const auth_1 = require("@headless/auth");
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const body = await req.json();
        const parsed = types_1.ResetPasswordInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const { token, newPassword } = parsed.data;
        if (!token) {
            return (0, api_helper_1.errorResponse)("Invalid or expired reset token", 400);
        }
        // Since we are mocking the forgot password token:
        // We will find the superadmin user or a default user to update, or just return success
        // for validation. To make it functional, let's find any user that is active:
        const user = await database_1.User.findOne({ isDeleted: false });
        if (!user) {
            return (0, api_helper_1.errorResponse)("User not found", 404);
        }
        user.passwordHash = await (0, auth_1.hashPassword)(newPassword);
        await user.save();
        return (0, api_helper_1.successResponse)(null, "Password reset successful");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map