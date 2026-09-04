"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const api_helper_1 = require("../../../lib/api-helper");
const types_1 = require("@headless/types");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const moods = types_1.MOODS.map((m) => ({
            id: m.toLowerCase(),
            name: m,
            slug: m.toLowerCase(),
            enabled: true,
        }));
        return (0, api_helper_1.successResponse)(moods);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map