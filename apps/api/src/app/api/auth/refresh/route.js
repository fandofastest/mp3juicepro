"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
const auth_1 = require("@headless/auth");
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const body = await req.json();
        const { refreshToken } = body;
        if (!refreshToken) {
            return (0, api_helper_1.errorResponse)("Refresh token is required", 400);
        }
        const payload = (0, auth_1.verifyRefreshToken)(refreshToken);
        if (!payload) {
            return (0, api_helper_1.errorResponse)("Invalid or expired refresh token", 401);
        }
        const user = await database_1.User.findById(payload.userId);
        if (!user || user.status === "suspended" || user.isDeleted) {
            return (0, api_helper_1.errorResponse)("User account unavailable", 401);
        }
        const newPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const newAccessToken = (0, auth_1.signAccessToken)(newPayload);
        const newRefreshToken = (0, auth_1.signRefreshToken)(newPayload);
        return (0, api_helper_1.successResponse)({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }, "Token refreshed successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map