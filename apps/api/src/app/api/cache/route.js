"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
const api_helper_1 = require("../../../lib/api-helper");
const utils_1 = require("@headless/utils");
async function DELETE(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const { searchParams } = new URL(req.url);
        const pattern = searchParams.get("pattern") || "*";
        await utils_1.CacheService.clearPattern(pattern);
        return (0, api_helper_1.successResponse)(null, `Cache keys matching pattern '${pattern}' cleared successfully`);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map