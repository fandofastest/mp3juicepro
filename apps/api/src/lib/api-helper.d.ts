import { NextResponse, NextRequest } from "next/server";
import { TokenPayload } from "@headless/auth";
export declare function addSecurityHeaders(response: NextResponse): NextResponse;
export declare function initApi(): Promise<void>;
export declare function checkRateLimit(ip: string, limit?: number, windowMs?: number): boolean;
export declare function successResponse<T>(data: T, message?: string, status?: number): NextResponse;
export declare function errorResponse(message: string, status?: number, errors?: any[]): NextResponse;
export declare function authenticateRequest(req: NextRequest): Promise<TokenPayload | null>;
export declare function authorizeRoles(userRole: any, requiredRole: any): boolean;
//# sourceMappingURL=api-helper.d.ts.map