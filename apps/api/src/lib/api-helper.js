"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSecurityHeaders = addSecurityHeaders;
exports.initApi = initApi;
exports.checkRateLimit = checkRateLimit;
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
exports.authenticateRequest = authenticateRequest;
exports.authorizeRoles = authorizeRoles;
const server_1 = require("next/server");
const database_1 = require("@headless/database");
const utils_1 = require("@headless/utils");
const auth_1 = require("@headless/auth");
// Standard security headers
function addSecurityHeaders(response) {
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
async function initApi() {
    await (0, database_1.connectToDatabase)();
    utils_1.CacheService.initialize();
    // Auto-seed if database is empty
    try {
        const userCount = await database_1.User.countDocuments();
        if (userCount === 0) {
            await (0, database_1.seedDatabase)();
        }
    }
    catch (err) {
        console.error("Auto seeding failed:", err);
    }
}
// Rate limiting in-memory fallback
const rateLimitMap = new Map();
function checkRateLimit(ip, limit = 100, windowMs = 60000) {
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
function successResponse(data, message = "Operation successful", status = 200) {
    const payload = {
        success: true,
        message,
        data,
    };
    const res = server_1.NextResponse.json(payload, { status });
    return addSecurityHeaders(res);
}
// Standard API Error Response
function errorResponse(message, status = 400, errors) {
    const payload = {
        success: false,
        message,
        errors,
    };
    const res = server_1.NextResponse.json(payload, { status });
    return addSecurityHeaders(res);
}
// Verify Authenticated Request
async function authenticateRequest(req) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.substring(7);
    return (0, auth_1.verifyAccessToken)(token);
}
// Check role accessibility
function authorizeRoles(userRole, requiredRole) {
    const roles = ["User", "Premium", "Moderator", "Admin", "Super Admin"];
    const userIdx = roles.indexOf(userRole);
    const reqIdx = roles.indexOf(requiredRole);
    return userIdx >= reqIdx;
}
//# sourceMappingURL=api-helper.js.map