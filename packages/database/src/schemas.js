"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayLog = exports.AppConfig = exports.Track = exports.Notification = exports.SystemSettings = exports.AuditLog = exports.AnalyticsEvent = exports.History = exports.Favorite = exports.Playlist = exports.Banner = exports.Category = exports.HomeSection = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String },
    country: { type: String, default: "US" },
    language: { type: String, default: "en" },
    theme: { type: String, default: "dark" },
    premium: { type: Boolean, default: false, index: true },
    verified: { type: Boolean, default: false },
    role: { type: String, enum: ["Super Admin", "Admin", "Moderator", "User", "Premium"], default: "User", index: true },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active", index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
}, { timestamps: true });
const HomeSectionSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    icon: { type: String },
    cover: { type: String },
    layout: { type: String, enum: ["carousel", "grid", "list", "banner"], required: true },
    type: {
        type: String,
        enum: ["search", "playlist", "artist", "album", "category", "featured", "recommendation", "history", "favorites", "manual", "banner"],
        required: true,
    },
    query: { type: String },
    limit: { type: Number, default: 10 },
    sortOrder: { type: Number, default: 0, index: true },
    enabled: { type: Boolean, default: true, index: true },
    provider: { type: String, default: "local" },
    providerConfig: { type: mongoose_1.Schema.Types.Map, of: mongoose_1.Schema.Types.Mixed },
    tracks: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
}, { timestamps: true });
const CategorySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    icon: { type: String },
    cover: { type: String },
    color: { type: String, default: "#1DB954" },
    sortOrder: { type: Number, default: 0, index: true },
    enabled: { type: Boolean, default: true, index: true },
    tracks: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
}, { timestamps: true });
const BannerSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    buttonText: { type: String },
    buttonColor: { type: String },
    targetType: {
        type: String,
        enum: ["url", "category", "genre", "playlist", "artist", "album", "song"],
        required: true,
    },
    targetId: { type: String },
    enabled: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
}, { timestamps: true });
const PlaylistSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    description: { type: String },
    cover: { type: String },
    creatorId: { type: String, required: true, index: true },
    creatorName: { type: String, required: true },
    isPublic: { type: Boolean, default: true, index: true },
    isCollaborative: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false, index: true },
    tracks: [mongoose_1.Schema.Types.Mixed],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
}, { timestamps: true });
const FavoriteSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ["song", "album", "artist", "playlist"], required: true, index: true },
    targetId: { type: String, required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
// Compound index to guarantee uniqueness of user's favorite
FavoriteSchema.index({ userId: 1, type: 1, targetId: 1 }, { unique: true });
const HistorySchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    vid: { type: String, required: true, index: true },
    trackId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String },
    cover: { type: String, required: true },
    duration: { type: Number, required: true },
    playedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: { createdAt: "playedAt", updatedAt: false } });
const AnalyticsEventSchema = new mongoose_1.Schema({
    eventType: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    metadata: { type: mongoose_1.Schema.Types.Map, of: mongoose_1.Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });
const AuditLogSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String },
    changes: { type: mongoose_1.Schema.Types.Map, of: mongoose_1.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
const SystemSettingsSchema = new mongoose_1.Schema({
    appName: { type: String, required: true, default: "MP3Juice Pro" },
    logo: { type: String },
    darkLogo: { type: String },
    primaryColor: { type: String, default: "#1DB954" }, // Spotify Green
    secondaryColor: { type: String, default: "#191414" },
    theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    language: { type: String, default: "en" },
    country: { type: String, default: "US" },
    searchLimit: { type: Number, default: 20 },
    cacheTtl: { type: Number, default: 3600 },
    maintenanceMode: { type: Boolean, default: false },
    minimumAppVersion: { type: String, default: "1.0.0" },
    apiKeys: { type: mongoose_1.Schema.Types.Map, of: String, default: {} },
}, { timestamps: true });
const NotificationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["Announcement", "Promotion", "Maintenance", "Popup", "Push Notification"],
        required: true,
        index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetUrl: { type: String },
    enabled: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
}, { timestamps: true });
const TrackSchema = new mongoose_1.Schema({
    vid: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    cover: { type: String, required: true },
    duration: { type: Number, required: true },
    provider: { type: String, default: "youtube", index: true },
}, { timestamps: true });
const AppConfigSchema = new mongoose_1.Schema({
    packageName: { type: String, required: true, unique: true, index: true },
    admob: {
        appId: { type: String },
        bannerAdUnitId: { type: String },
        interstitialAdUnitId: { type: String },
        interSplashAdUnitId: { type: String },
        openAdUnitId: { type: String },
        rewardedAdUnitId: { type: String },
        nativeAdUnitId: { type: String },
    },
    applovin: {
        sdkKey: { type: String },
        bannerAdUnitId: { type: String },
        interstitialAdUnitId: { type: String },
        interSplashAdUnitId: { type: String },
        openAdUnitId: { type: String },
        rewardedAdUnitId: { type: String },
        nativeAdUnitId: { type: String },
    },
    ads: {
        bannerEnabled: { type: Boolean, default: false },
        interstitialEnabled: { type: Boolean, default: false },
        interSplashEnabled: { type: Boolean, default: false },
        openAdsEnabled: { type: Boolean, default: false },
        rewardedEnabled: { type: Boolean, default: false },
        nativeEnabled: { type: Boolean, default: false },
        interstitialInterval: { type: Number, default: 5 },
        adProvider: { type: String, enum: ["admob", "applovin", "none"], default: "none" },
    },
    promoBanner: {
        enabled: { type: Boolean, default: false },
        image: { type: String },
        targetUrl: { type: String },
    },
    appUpdate: {
        forceUpdate: { type: Boolean, default: false },
        minimumVersion: { type: String },
        updateUrl: { type: String },
    },
    safeMode: { type: Boolean, default: false },
}, { timestamps: true });
const PlayLogSchema = new mongoose_1.Schema({
    vid: { type: String, required: true, index: true },
    title: { type: String },
    artist: { type: String },
    playUrl: { type: String, required: true },
    packageName: { type: String, index: true },
    userId: { type: String, index: true },
    ipAddress: { type: String },
    userAgent: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
// Export Mongoose Models
if (mongoose_1.default.models.Category)
    delete mongoose_1.default.models.Category;
if (mongoose_1.default.models.History)
    delete mongoose_1.default.models.History;
if (mongoose_1.default.models.HomeSection)
    delete mongoose_1.default.models.HomeSection;
if (mongoose_1.default.models.AppConfig)
    delete mongoose_1.default.models.AppConfig;
if (mongoose_1.default.models.PlayLog)
    delete mongoose_1.default.models.PlayLog;
exports.User = mongoose_1.default.models.User || mongoose_1.default.model("User", UserSchema);
exports.HomeSection = mongoose_1.default.models.HomeSection || mongoose_1.default.model("HomeSection", HomeSectionSchema);
exports.Category = mongoose_1.default.models.Category || mongoose_1.default.model("Category", CategorySchema);
exports.Banner = mongoose_1.default.models.Banner || mongoose_1.default.model("Banner", BannerSchema);
exports.Playlist = mongoose_1.default.models.Playlist || mongoose_1.default.model("Playlist", PlaylistSchema);
exports.Favorite = mongoose_1.default.models.Favorite || mongoose_1.default.model("Favorite", FavoriteSchema);
exports.History = mongoose_1.default.models.History || mongoose_1.default.model("History", HistorySchema);
exports.AnalyticsEvent = mongoose_1.default.models.AnalyticsEvent || mongoose_1.default.model("AnalyticsEvent", AnalyticsEventSchema);
exports.AuditLog = mongoose_1.default.models.AuditLog || mongoose_1.default.model("AuditLog", AuditLogSchema);
exports.SystemSettings = mongoose_1.default.models.SystemSettings || mongoose_1.default.model("SystemSettings", SystemSettingsSchema);
exports.Notification = mongoose_1.default.models.Notification || mongoose_1.default.model("Notification", NotificationSchema);
exports.Track = mongoose_1.default.models.Track || mongoose_1.default.model("Track", TrackSchema);
exports.AppConfig = mongoose_1.default.models.AppConfig || mongoose_1.default.model("AppConfig", AppConfigSchema);
exports.PlayLog = mongoose_1.default.models.PlayLog || mongoose_1.default.model("PlayLog", PlayLogSchema);
//# sourceMappingURL=schemas.js.map