import mongoose, { Document } from "mongoose";
import { UserRole, UserStatus, SectionType } from "@headless/types";
export interface IAuditable extends Document {
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    deletedAt?: Date;
}
export interface IUserDocument extends IAuditable {
    username: string;
    displayName: string;
    email: string;
    passwordHash: string;
    avatar?: string;
    bio?: string;
    country?: string;
    language?: string;
    theme?: string;
    premium: boolean;
    verified: boolean;
    role: UserRole;
    status: UserStatus;
}
export interface IHomeSectionDocument extends IAuditable {
    title: string;
    subtitle?: string;
    icon?: string;
    cover?: string;
    layout: "carousel" | "grid" | "list" | "banner";
    type: SectionType;
    query?: string;
    limit: number;
    sortOrder: number;
    enabled: boolean;
    provider: string;
    providerConfig?: Map<string, any>;
    tracks?: any[];
}
export interface ICategoryDocument extends Document {
    title: string;
    slug: string;
    description?: string;
    icon?: string;
    cover?: string;
    color?: string;
    sortOrder: number;
    enabled: boolean;
    tracks?: any[];
    isDeleted: boolean;
    deletedAt?: Date;
}
export interface IBannerDocument extends IAuditable {
    title: string;
    subtitle?: string;
    image: string;
    buttonText?: string;
    buttonColor?: string;
    targetType: "url" | "category" | "genre" | "playlist" | "artist" | "album" | "song";
    targetId?: string;
    enabled: boolean;
    sortOrder: number;
}
export interface IPlaylistDocument extends IAuditable {
    title: string;
    slug: string;
    description?: string;
    cover?: string;
    creatorId: string;
    creatorName: string;
    isPublic: boolean;
    isCollaborative: boolean;
    isPinned: boolean;
    tracks: Array<any>;
}
export interface IFavoriteDocument extends Document {
    userId: string;
    type: "song" | "album" | "artist" | "playlist";
    targetId: string;
    createdAt: Date;
}
export interface IHistoryDocument extends Document {
    userId: string;
    vid: string;
    trackId: string;
    title: string;
    artist: string;
    album?: string;
    cover: string;
    duration: number;
    playedAt: Date;
}
export interface IAnalyticsEventDocument extends Document {
    eventType: string;
    userId?: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
export interface IAuditLogDocument extends Document {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export interface ISystemSettingsDocument extends Document {
    appName: string;
    logo?: string;
    darkLogo?: string;
    primaryColor: string;
    secondaryColor: string;
    theme: "dark" | "light" | "system";
    language: string;
    country: string;
    searchLimit: number;
    cacheTtl: number;
    maintenanceMode: boolean;
    minimumAppVersion: string;
    apiKeys: Map<string, string>;
}
export interface INotificationDocument extends IAuditable {
    type: "Announcement" | "Promotion" | "Maintenance" | "Popup" | "Push Notification";
    title: string;
    message: string;
    targetUrl?: string;
    enabled: boolean;
}
export interface ITrackDocument extends Document {
    vid: string;
    title: string;
    artist: string;
    cover: string;
    duration: number;
    provider: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAppConfigDocument extends Document {
    packageName: string;
    admob: {
        appId?: string;
        bannerAdUnitId?: string;
        interstitialAdUnitId?: string;
        interSplashAdUnitId?: string;
        openAdUnitId?: string;
        rewardedAdUnitId?: string;
        nativeAdUnitId?: string;
    };
    applovin: {
        sdkKey?: string;
        bannerAdUnitId?: string;
        interstitialAdUnitId?: string;
        interSplashAdUnitId?: string;
        openAdUnitId?: string;
        rewardedAdUnitId?: string;
        nativeAdUnitId?: string;
    };
    ads: {
        bannerEnabled: boolean;
        interstitialEnabled: boolean;
        interSplashEnabled: boolean;
        openAdsEnabled?: boolean;
        rewardedEnabled: boolean;
        nativeEnabled: boolean;
        interstitialInterval: number;
        adProvider: "admob" | "applovin" | "none";
    };
    promoBanner?: {
        enabled: boolean;
        image?: string;
        targetUrl?: string;
    };
    appUpdate?: {
        forceUpdate: boolean;
        minimumVersion?: string;
        updateUrl?: string;
    };
    safeMode: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IPlayLogDocument extends Document {
    vid: string;
    title?: string;
    artist?: string;
    playUrl: string;
    packageName?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export declare const User: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const HomeSection: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Category: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Banner: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Playlist: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Favorite: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const History: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const AnalyticsEvent: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const AuditLog: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const SystemSettings: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Notification: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const Track: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const AppConfig: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const PlayLog: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=schemas.d.ts.map