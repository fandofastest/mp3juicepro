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
        // Validation
        const parsed = types_1.LoginInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const { email, password, rememberMe } = parsed.data;
        // Find User
        const user = await database_1.User.findOne({ email: email.toLowerCase(), isDeleted: false });
        if (!user) {
            return (0, api_helper_1.errorResponse)("Invalid credentials", 401);
        }
        if (user.status === "suspended") {
            return (0, api_helper_1.errorResponse)("Account suspended. Contact support.", 403);
        }
        // Verify Password
        const isValid = await (0, auth_1.comparePassword)(password, user.passwordHash);
        if (!isValid) {
            return (0, api_helper_1.errorResponse)("Invalid credentials", 401);
        }
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, auth_1.signAccessToken)(payload, rememberMe);
        const refreshToken = (0, auth_1.signRefreshToken)(payload, rememberMe);
        // Audit log
        await database_1.AuditLog.create({
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
        return (0, api_helper_1.successResponse)({
            user: userProfile,
            accessToken,
            refreshToken,
        }, "Login successful");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map