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
        const { token } = body; // Mock Google OAuth token
        if (!token) {
            return (0, api_helper_1.errorResponse)("Google authorization token is required", 400);
        }
        // Mock Google validation: We extract email from token (assume it's email for simplicity)
        const email = token.includes("@") ? token : "googleuser@mp3juice.pro";
        const username = email.split("@")[0] + "_google";
        let user = await database_1.User.findOne({ email: email.toLowerCase(), isDeleted: false });
        if (!user) {
            user = await database_1.User.create({
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
        const accessToken = (0, auth_1.signAccessToken)(payload);
        const refreshToken = (0, auth_1.signRefreshToken)(payload);
        return (0, api_helper_1.successResponse)({
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
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map