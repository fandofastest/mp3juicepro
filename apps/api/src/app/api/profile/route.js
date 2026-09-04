"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
const types_1 = require("@headless/types");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload) {
            return (0, api_helper_1.errorResponse)("Unauthorized", 401);
        }
        const user = await database_1.User.findById(userPayload.userId).select("-passwordHash");
        if (!user || user.isDeleted) {
            return (0, api_helper_1.errorResponse)("User not found", 404);
        }
        return (0, api_helper_1.successResponse)(user);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function PUT(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload) {
            return (0, api_helper_1.errorResponse)("Unauthorized", 401);
        }
        const body = await req.json();
        const parsed = types_1.UpdateProfileInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const user = await database_1.User.findById(userPayload.userId);
        if (!user || user.isDeleted) {
            return (0, api_helper_1.errorResponse)("User not found", 404);
        }
        const data = parsed.data;
        if (data.displayName !== undefined)
            user.displayName = data.displayName;
        if (data.bio !== undefined)
            user.bio = data.bio;
        if (data.avatar !== undefined)
            user.avatar = data.avatar;
        if (data.country !== undefined)
            user.country = data.country;
        if (data.language !== undefined)
            user.language = data.language;
        if (data.theme !== undefined)
            user.theme = data.theme;
        await user.save();
        const updatedProfile = await database_1.User.findById(userPayload.userId).select("-passwordHash");
        return (0, api_helper_1.successResponse)(updatedProfile, "Profile updated successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map