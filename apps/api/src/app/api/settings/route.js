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
        let settings = await database_1.SystemSettings.findOne();
        if (!settings) {
            // Create defaults
            settings = await database_1.SystemSettings.create({
                appName: "MP3Juice Pro",
                primaryColor: "#1DB954",
                secondaryColor: "#191414",
                theme: "dark",
                language: "en",
                country: "US",
                searchLimit: 20,
                cacheTtl: 3600,
                maintenanceMode: false,
                minimumAppVersion: "1.0.0",
                apiKeys: {},
            });
        }
        return (0, api_helper_1.successResponse)(settings);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function PUT(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const body = await req.json();
        const parsed = types_1.SystemSettingsInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        let settings = await database_1.SystemSettings.findOne();
        if (!settings) {
            settings = new database_1.SystemSettings(parsed.data);
        }
        else {
            Object.assign(settings, parsed.data);
        }
        await settings.save();
        return (0, api_helper_1.successResponse)(settings, "Settings updated successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map