"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigInputSchema = exports.SystemSettingsInputSchema = exports.PlaylistInputSchema = exports.HomeSectionInputSchema = exports.BannerInputSchema = exports.MOODS = exports.GENRES = exports.CategoryInputSchema = exports.UpdateProfileInputSchema = exports.ResetPasswordInputSchema = exports.ForgotPasswordInputSchema = exports.LoginInputSchema = exports.RegisterInputSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.enum(["Super Admin", "Admin", "Moderator", "User", "Premium"]);
exports.RegisterInputSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(30),
    displayName: zod_1.z.string().min(2).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    country: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
});
exports.LoginInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    rememberMe: zod_1.z.boolean().optional(),
});
exports.ForgotPasswordInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.ResetPasswordInputSchema = zod_1.z.object({
    token: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8),
});
exports.UpdateProfileInputSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(2).max(50).optional(),
    bio: zod_1.z.string().max(200).optional(),
    avatar: zod_1.z.string().url().optional(),
    country: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional(),
});
exports.CategoryInputSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    slug: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    cover: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number().default(0),
    enabled: zod_1.z.boolean().default(true),
    tracks: zod_1.z.array(zod_1.z.any()).default([]).optional(),
});
// Genre & Mood Lists
exports.GENRES = [
    "Pop", "Rock", "Jazz", "Hip Hop", "EDM", "Classical", "Country",
    "Metal", "R&B", "KPop", "Indie", "Lofi", "Instrumental", "Acoustic", "Custom"
];
exports.MOODS = [
    "Workout", "Focus", "Sleep", "Study", "Party", "Relax",
    "Morning", "Night", "Travel", "Driving", "Gaming", "Coding", "Meditation", "Custom"
];
exports.BannerInputSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().optional(),
    image: zod_1.z.string().url(),
    buttonText: zod_1.z.string().optional(),
    buttonColor: zod_1.z.string().optional(),
    targetType: zod_1.z.enum(["url", "category", "genre", "playlist", "artist", "album", "song"]),
    targetId: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().default(true),
    sortOrder: zod_1.z.number().default(0),
});
exports.HomeSectionInputSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    subtitle: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    cover: zod_1.z.string().optional(),
    layout: zod_1.z.enum(["carousel", "grid", "list", "banner"]),
    type: zod_1.z.enum([
        "search", "playlist", "artist", "album", "category",
        "featured", "recommendation", "history", "favorites", "manual", "banner"
    ]),
    query: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(100).default(10),
    sortOrder: zod_1.z.number().default(0),
    enabled: zod_1.z.boolean().default(true),
    provider: zod_1.z.string().default("local"),
    providerConfig: zod_1.z.record(zod_1.z.any()).optional(),
    tracks: zod_1.z.array(zod_1.z.any()).optional(),
});
exports.PlaylistInputSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    cover: zod_1.z.string().optional(),
    isPublic: zod_1.z.boolean().default(true),
    isCollaborative: zod_1.z.boolean().default(false),
    isPinned: zod_1.z.boolean().default(false),
    tracks: zod_1.z.array(zod_1.z.any()).default([]),
});
exports.SystemSettingsInputSchema = zod_1.z.object({
    appName: zod_1.z.string().min(1),
    logo: zod_1.z.string().optional(),
    darkLogo: zod_1.z.string().optional(),
    primaryColor: zod_1.z.string(),
    secondaryColor: zod_1.z.string(),
    theme: zod_1.z.enum(["dark", "light", "system"]),
    language: zod_1.z.string(),
    country: zod_1.z.string(),
    searchLimit: zod_1.z.number().min(1),
    cacheTtl: zod_1.z.number().min(0),
    maintenanceMode: zod_1.z.boolean(),
    minimumAppVersion: zod_1.z.string(),
    apiKeys: zod_1.z.record(zod_1.z.string()).default({}),
});
exports.AppConfigInputSchema = zod_1.z.object({
    packageName: zod_1.z.string().min(3),
    admob: zod_1.z.object({
        appId: zod_1.z.string().optional(),
        bannerAdUnitId: zod_1.z.string().optional(),
        interstitialAdUnitId: zod_1.z.string().optional(),
        interSplashAdUnitId: zod_1.z.string().optional(),
        openAdUnitId: zod_1.z.string().optional(),
        rewardedAdUnitId: zod_1.z.string().optional(),
        nativeAdUnitId: zod_1.z.string().optional(),
    }).default({}),
    applovin: zod_1.z.object({
        sdkKey: zod_1.z.string().optional(),
        bannerAdUnitId: zod_1.z.string().optional(),
        interstitialAdUnitId: zod_1.z.string().optional(),
        interSplashAdUnitId: zod_1.z.string().optional(),
        openAdUnitId: zod_1.z.string().optional(),
        rewardedAdUnitId: zod_1.z.string().optional(),
        nativeAdUnitId: zod_1.z.string().optional(),
    }).default({}),
    ads: zod_1.z.object({
        bannerEnabled: zod_1.z.boolean().default(false),
        interstitialEnabled: zod_1.z.boolean().default(false),
        interSplashEnabled: zod_1.z.boolean().default(false),
        openAdsEnabled: zod_1.z.boolean().default(false).optional(),
        rewardedEnabled: zod_1.z.boolean().default(false),
        nativeEnabled: zod_1.z.boolean().default(false),
        interstitialInterval: zod_1.z.number().default(5),
        adProvider: zod_1.z.enum(["admob", "applovin", "none"]).default("none"),
    }).default({}),
    promoBanner: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        image: zod_1.z.string().optional(),
        targetUrl: zod_1.z.string().optional(),
    }).default({}),
    appUpdate: zod_1.z.object({
        forceUpdate: zod_1.z.boolean().default(false),
        minimumVersion: zod_1.z.string().optional(),
        updateUrl: zod_1.z.string().optional(),
    }).default({}),
    safeMode: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=index.js.map