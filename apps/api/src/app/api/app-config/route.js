"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const api_helper_1 = require("../../../lib/api-helper");
const database_1 = require("@headless/database");
const types_1 = require("@headless/types");
async function GET(req) {
    try {
        await (0, api_helper_1.initApi)();
        const { searchParams } = new URL(req.url);
        const packageName = searchParams.get("packageName");
        if (packageName) {
            // 1. Attempt to fetch live central remote config from newconfig dashboard
            try {
                const newconfigUrl = process.env.NEWCONFIG_API_URL || "https://newconfig-bmuj.vercel.app";
                const res = await fetch(`${newconfigUrl}/api/config/${encodeURIComponent(packageName)}`, {
                    cache: "no-store",
                    headers: {
                        "x-forwarded-for": req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
                        "user-agent": req.headers.get("user-agent") || "",
                    },
                });
                if (res.ok) {
                    const remoteData = await res.json();
                    if (remoteData && !remoteData.error) {
                        return (0, api_helper_1.successResponse)(remoteData);
                    }
                }
            }
            catch (err) {
                console.error("Failed to fetch central remote config, falling back to local DB:", err.message);
            }
            // 2. Fallback to local database AppConfig if remote config is unreachable
            const config = await database_1.AppConfig.findOne({ packageName });
            if (!config) {
                return (0, api_helper_1.successResponse)({
                    packageName,
                    admob: {
                        appId: "",
                        bannerAdUnitId: "",
                        interstitialAdUnitId: "",
                        interSplashAdUnitId: "",
                        openAdUnitId: "",
                        rewardedAdUnitId: "",
                        nativeAdUnitId: "",
                    },
                    applovin: {
                        sdkKey: "",
                        bannerAdUnitId: "",
                        interstitialAdUnitId: "",
                        interSplashAdUnitId: "",
                        openAdUnitId: "",
                        rewardedAdUnitId: "",
                        nativeAdUnitId: "",
                    },
                    ads: {
                        bannerEnabled: false,
                        interstitialEnabled: false,
                        interSplashEnabled: false,
                        openAdsEnabled: false,
                        rewardedEnabled: false,
                        nativeEnabled: false,
                        interstitialInterval: 5,
                        adProvider: "none",
                    },
                    promoBanner: {
                        enabled: false,
                        image: "",
                        targetUrl: "",
                    },
                    appUpdate: {
                        forceUpdate: false,
                        minimumVersion: "1.0.0",
                        updateUrl: "",
                    },
                    safeMode: false
                });
            }
            return (0, api_helper_1.successResponse)(config);
        }
        // Admin only - list all app configurations
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const configs = await database_1.AppConfig.find().sort({ createdAt: -1 });
        return (0, api_helper_1.successResponse)(configs);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const body = await req.json();
        const parsed = types_1.AppConfigInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const existing = await database_1.AppConfig.findOne({ packageName: parsed.data.packageName });
        if (existing) {
            return (0, api_helper_1.errorResponse)("Configuration for this package name already exists", 400);
        }
        const config = await database_1.AppConfig.create(parsed.data);
        return (0, api_helper_1.successResponse)(config, "App configuration created successfully", 201);
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
        const { id, ...data } = body;
        if (!id) {
            return (0, api_helper_1.errorResponse)("Configuration ID is required", 400);
        }
        const config = await database_1.AppConfig.findById(id);
        if (!config) {
            return (0, api_helper_1.errorResponse)("App configuration not found", 404);
        }
        if (data.packageName && data.packageName !== config.packageName) {
            const existing = await database_1.AppConfig.findOne({ packageName: data.packageName });
            if (existing) {
                return (0, api_helper_1.errorResponse)("Configuration for this package name already exists", 400);
            }
        }
        Object.assign(config, data);
        await config.save();
        return (0, api_helper_1.successResponse)(config, "App configuration updated successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
async function DELETE(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload || !(0, api_helper_1.authorizeRoles)(userPayload.role, "Admin")) {
            return (0, api_helper_1.errorResponse)("Unauthorized access", 403);
        }
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return (0, api_helper_1.errorResponse)("Configuration ID is required", 400);
        }
        const config = await database_1.AppConfig.findById(id);
        if (!config) {
            return (0, api_helper_1.errorResponse)("App configuration not found", 404);
        }
        await database_1.AppConfig.findByIdAndDelete(id);
        return (0, api_helper_1.successResponse)(null, "App configuration deleted successfully");
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map