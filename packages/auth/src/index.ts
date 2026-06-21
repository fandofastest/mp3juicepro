import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserRole } from "@headless/types";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_123456_key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_123456_key";

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Access Token
export function signAccessToken(payload: TokenPayload, rememberMe = false): string {
  const expiresIn = rememberMe ? "7d" : "15m";
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn });
}

// JWT Refresh Token
export function signRefreshToken(payload: TokenPayload, rememberMe = false): string {
  const expiresIn = rememberMe ? "30d" : "7d";
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Role Hierarchy Definition
const ROLE_HIERARCHY: Record<UserRole, number> = {
  "Super Admin": 4,
  "Admin": 3,
  "Moderator": 2,
  "Premium": 1,
  "User": 0,
};

export function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const userRank = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredRank = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userRank >= requiredRank;
}
