"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const user = await (0, api_helper_1.authenticateRequest)(req);
        if (user) {
            await database_1.AuditLog.create({
                userId: user.userId,
                action: "logout",
                resource: "auth",
                ipAddress: req.headers.get("x-forwarded-for") || undefined,
                userAgent: req.headers.get("user-agent") || undefined,
            });
        }
        return (0, api_helper_1.successResponse)(null, "Logout successful");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map