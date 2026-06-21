import mongoose, { Schema, Document } from "mongoose";
import { UserRole, UserStatus, SectionType } from "@headless/types";

// --- AUDIT INTERFACE & HELPER ---
export interface IAuditable extends Document {
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

// --- USER SCHEMA ---
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

const UserSchema = new Schema<IUserDocument>(
  {
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
  },
  { timestamps: true }
);

// --- HOME BUILDER SECTION SCHEMA ---
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
}

const HomeSectionSchema = new Schema<IHomeSectionDocument>(
  {
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
    providerConfig: { type: Schema.Types.Map, of: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// --- CATEGORY SCHEMA ---
export interface ICategoryDocument extends IAuditable {
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  cover?: string;
  color?: string;
  sortOrder: number;
  enabled: boolean;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    icon: { type: String },
    cover: { type: String },
    color: { type: String },
    sortOrder: { type: Number, default: 0, index: true },
    enabled: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// --- BANNER SCHEMA ---
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

const BannerSchema = new Schema<IBannerDocument>(
  {
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
  },
  { timestamps: true }
);

// --- PLAYLIST SCHEMA ---
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

const PlaylistSchema = new Schema<IPlaylistDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    description: { type: String },
    cover: { type: String },
    creatorId: { type: String, required: true, index: true },
    creatorName: { type: String, required: true },
    isPublic: { type: Boolean, default: true, index: true },
    isCollaborative: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false, index: true },
    tracks: [Schema.Types.Mixed],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// --- FAVORITES SCHEMA ---
export interface IFavoriteDocument extends Document {
  userId: string;
  type: "song" | "album" | "artist" | "playlist";
  targetId: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavoriteDocument>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ["song", "album", "artist", "playlist"], required: true, index: true },
    targetId: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
// Compound index to guarantee uniqueness of user's favorite
FavoriteSchema.index({ userId: 1, type: 1, targetId: 1 }, { unique: true });

// --- HISTORY SCHEMA ---
export interface IHistoryDocument extends Document {
  userId: string;
  trackId: string;
  title: string;
  artist: string;
  album?: string;
  cover: string;
  duration: number;
  playedAt: Date;
}

const HistorySchema = new Schema<IHistoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    trackId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String },
    cover: { type: String, required: true },
    duration: { type: Number, required: true },
    playedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: "playedAt", updatedAt: false } }
);

// --- ANALYTICS EVENT SCHEMA ---
export interface IAnalyticsEventDocument extends Document {
  eventType: string;
  userId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEventDocument>(
  {
    eventType: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// --- AUDIT LOG SCHEMA ---
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

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String },
    changes: { type: Schema.Types.Map, of: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// --- SYSTEM SETTINGS SCHEMA ---
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

const SystemSettingsSchema = new Schema<ISystemSettingsDocument>(
  {
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
    apiKeys: { type: Schema.Types.Map, of: String, default: {} },
  },
  { timestamps: true }
);

// --- NOTIFICATION SCHEMA ---
export interface INotificationDocument extends IAuditable {
  type: "Announcement" | "Promotion" | "Maintenance" | "Popup" | "Push Notification";
  title: string;
  message: string;
  targetUrl?: string;
  enabled: boolean;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
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
  },
  { timestamps: true }
);

// Export Mongoose Models
export const User = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
export const HomeSection = mongoose.models.HomeSection || mongoose.model<IHomeSectionDocument>("HomeSection", HomeSectionSchema);
export const Category = mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);
export const Banner = mongoose.models.Banner || mongoose.model<IBannerDocument>("Banner", BannerSchema);
export const Playlist = mongoose.models.Playlist || mongoose.model<IPlaylistDocument>("Playlist", PlaylistSchema);
export const Favorite = mongoose.models.Favorite || mongoose.model<IFavoriteDocument>("Favorite", FavoriteSchema);
export const History = mongoose.models.History || mongoose.model<IHistoryDocument>("History", HistorySchema);
export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEventDocument>("AnalyticsEvent", AnalyticsEventSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);
export const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettingsDocument>("SystemSettings", SystemSettingsSchema);
export const Notification = mongoose.models.Notification || mongoose.model<INotificationDocument>("Notification", NotificationSchema);

