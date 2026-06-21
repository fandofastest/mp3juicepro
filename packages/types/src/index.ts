import { z } from "zod";

// Roles
export type UserRole = "Super Admin" | "Admin" | "Moderator" | "User" | "Premium";

export const UserRoleSchema = z.enum(["Super Admin", "Admin", "Moderator", "User", "Premium"]);

// User Profile Status
export type UserStatus = "active" | "inactive" | "suspended";

// User Interfaces
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  country?: string;
  language?: string;
  theme?: string;
  premium: boolean;
  verified: boolean;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const RegisterInputSchema = z.object({
  username: z.string().min(3).max(30),
  displayName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  country: z.string().optional(),
  language: z.string().optional(),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

export const ForgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordInputSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export const UpdateProfileInputSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
  avatar: z.string().url().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  theme: z.string().optional(),
});

// Category
export interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  cover?: string;
  color?: string;
  sortOrder: number;
  enabled: boolean;
  tracks?: any[];
}

export const CategoryInputSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  cover: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().default(0),
  enabled: z.boolean().default(true),
  tracks: z.array(z.any()).default([]).optional(),
});

// Genre & Mood Lists
export const GENRES = [
  "Pop", "Rock", "Jazz", "Hip Hop", "EDM", "Classical", "Country", 
  "Metal", "R&B", "KPop", "Indie", "Lofi", "Instrumental", "Acoustic", "Custom"
] as const;

export const MOODS = [
  "Workout", "Focus", "Sleep", "Study", "Party", "Relax", 
  "Morning", "Night", "Travel", "Driving", "Gaming", "Coding", "Meditation", "Custom"
] as const;

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  enabled: boolean;
}

export interface Mood {
  id: string;
  name: string;
  slug: string;
  description?: string;
  enabled: boolean;
}

// Banners
export interface Banner {
  id: string;
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

export const BannerInputSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.string().url(),
  buttonText: z.string().optional(),
  buttonColor: z.string().optional(),
  targetType: z.enum(["url", "category", "genre", "playlist", "artist", "album", "song"]),
  targetId: z.string().optional(),
  enabled: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

// Home Builder Section Types
export type SectionType = 
  | "search" 
  | "playlist" 
  | "artist" 
  | "album" 
  | "category" 
  | "featured" 
  | "recommendation" 
  | "history" 
  | "favorites" 
  | "manual" 
  | "banner";

export interface HomeSection {
  id: string;
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
  providerConfig?: Record<string, any>;
  tracks?: any[];
}

export const HomeSectionInputSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  icon: z.string().optional(),
  cover: z.string().optional(),
  layout: z.enum(["carousel", "grid", "list", "banner"]),
  type: z.enum([
    "search", "playlist", "artist", "album", "category", 
    "featured", "recommendation", "history", "favorites", "manual", "banner"
  ]),
  query: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  sortOrder: z.number().default(0),
  enabled: z.boolean().default(true),
  provider: z.string().default("local"),
  providerConfig: z.record(z.any()).optional(),
  tracks: z.array(z.any()).optional(),
});

// Normalized Music Objects for Providers
export interface NormalizedTrack {
  id: string;
  vid?: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  cover: string;
  duration: number; // in seconds
  url?: string;
  provider: string;
}

export interface NormalizedArtist {
  id: string;
  name: string;
  avatar: string;
  genres?: string[];
  provider: string;
}

export interface NormalizedAlbum {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  cover: string;
  releaseDate?: string;
  provider: string;
  tracks?: NormalizedTrack[];
}

export interface NormalizedSearchResults {
  tracks: NormalizedTrack[];
  albums: NormalizedAlbum[];
  artists: NormalizedArtist[];
}

// Playlists
export interface Playlist {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover?: string;
  creatorId: string;
  creatorName: string;
  isPublic: boolean;
  isCollaborative: boolean;
  isPinned: boolean;
  tracks: NormalizedTrack[];
  createdAt: Date;
  updatedAt: Date;
}

export const PlaylistInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  cover: z.string().optional(),
  isPublic: z.boolean().default(true),
  isCollaborative: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  tracks: z.array(z.any()).default([]),
});

// Settings Schema
export interface SystemSettings {
  appName: string;
  logo?: string;
  darkLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  theme: "dark" | "light" | "system";
  language: string;
  country: string;
  searchLimit: number;
  cacheTtl: number; // in seconds
  maintenanceMode: boolean;
  minimumAppVersion: string;
  apiKeys: Record<string, string>;
}

export const SystemSettingsInputSchema = z.object({
  appName: z.string().min(1),
  logo: z.string().optional(),
  darkLogo: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  theme: z.enum(["dark", "light", "system"]),
  language: z.string(),
  country: z.string(),
  searchLimit: z.number().min(1),
  cacheTtl: z.number().min(0),
  maintenanceMode: z.boolean(),
  minimumAppVersion: z.string(),
  apiKeys: z.record(z.string()).default({}),
});

// Standard API Response DTOs
export interface ApiResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any[];
}

// App Config Schema for Ads & AdMob per package name
export interface AppConfig {
  id: string;
  packageName: string;
  admob: {
    appId?: string;
    bannerAdUnitId?: string;
    interstitialAdUnitId?: string;
    rewardedAdUnitId?: string;
    nativeAdUnitId?: string;
  };
  applovin: {
    sdkKey?: string;
    bannerAdUnitId?: string;
    interstitialAdUnitId?: string;
    rewardedAdUnitId?: string;
    nativeAdUnitId?: string;
  };
  ads: {
    bannerEnabled: boolean;
    interstitialEnabled: boolean;
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

export const AppConfigInputSchema = z.object({
  packageName: z.string().min(3),
  admob: z.object({
    appId: z.string().optional(),
    bannerAdUnitId: z.string().optional(),
    interstitialAdUnitId: z.string().optional(),
    rewardedAdUnitId: z.string().optional(),
    nativeAdUnitId: z.string().optional(),
  }).default({}),
  applovin: z.object({
    sdkKey: z.string().optional(),
    bannerAdUnitId: z.string().optional(),
    interstitialAdUnitId: z.string().optional(),
    rewardedAdUnitId: z.string().optional(),
    nativeAdUnitId: z.string().optional(),
  }).default({}),
  ads: z.object({
    bannerEnabled: z.boolean().default(false),
    interstitialEnabled: z.boolean().default(false),
    rewardedEnabled: z.boolean().default(false),
    nativeEnabled: z.boolean().default(false),
    interstitialInterval: z.number().default(5),
    adProvider: z.enum(["admob", "applovin", "none"]).default("none"),
  }).default({}),
  promoBanner: z.object({
    enabled: z.boolean().default(false),
    image: z.string().optional(),
    targetUrl: z.string().optional(),
  }).default({}),
  appUpdate: z.object({
    forceUpdate: z.boolean().default(false),
    minimumVersion: z.string().optional(),
    updateUrl: z.string().optional(),
  }).default({}),
  safeMode: z.boolean().default(false),
});
