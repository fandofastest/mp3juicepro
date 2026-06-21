import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase, User, seedDatabase } from "@headless/database";
import { CacheService } from "@headless/utils";
import { verifyAccessToken, TokenPayload } from "@headless/auth";
import { ApiResponse, ApiErrorResponse } from "@headless/types";

// Standard security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Content-Security-Policy", "default-src 'self'");
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  return response;
}

// Global initialization helper
export async function initApi() {
  await connectToDatabase();
  CacheService.initialize();

  // Auto-seed if database is empty
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await seedDatabase();
    }
  } catch (err) {
    console.error("Auto seeding failed:", err);
  }
}

// Rate limiting in-memory fallback
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const client = rateLimitMap.get(ip);

  if (!client) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > client.resetTime) {
    client.count = 1;
    client.resetTime = now + windowMs;
    return true;
  }

  client.count += 1;
  return client.count <= limit;
}

// Standard API Success Response
export function successResponse<T>(data: T, message = "Operation successful", status = 200): NextResponse {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  const res = NextResponse.json(payload, { status });
  return addSecurityHeaders(res);
}

// Standard API Error Response
export function errorResponse(message: string, status = 400, errors?: any[]): NextResponse {
  const payload: ApiErrorResponse = {
    success: false,
    message,
    errors,
  };
  const res = NextResponse.json(payload, { status });
  return addSecurityHeaders(res);
}

// Verify Authenticated Request
export async function authenticateRequest(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// Check role accessibility
export function authorizeRoles(userRole: any, requiredRole: any): boolean {
  const roles = ["User", "Premium", "Moderator", "Admin", "Super Admin"];
  const userIdx = roles.indexOf(userRole);
  const reqIdx = roles.indexOf(requiredRole);
  return userIdx >= reqIdx;
}
