"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.hasRoleAccess = hasRoleAccess;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_123456_key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_123456_key";
// Password Hashing
async function hashPassword(password) {
    const salt = await bcrypt_1.default.genSalt(10);
    return bcrypt_1.default.hash(password, salt);
}
async function comparePassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
// JWT Access Token
function signAccessToken(payload, rememberMe = false) {
    const expiresIn = rememberMe ? "7d" : "15m";
    return jsonwebtoken_1.default.sign(payload, JWT_ACCESS_SECRET, { expiresIn });
}
// JWT Refresh Token
function signRefreshToken(payload, rememberMe = false) {
    const expiresIn = rememberMe ? "30d" : "7d";
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET);
    }
    catch {
        return null;
    }
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
    }
    catch {
        return null;
    }
}
// Role Hierarchy Definition
const ROLE_HIERARCHY = {
    "Super Admin": 4,
    "Admin": 3,
    "Moderator": 2,
    "Premium": 1,
    "User": 0,
};
function hasRoleAccess(userRole, requiredRole) {
    const userRank = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredRank = ROLE_HIERARCHY[requiredRole] ?? 0;
    return userRank >= requiredRank;
}
//# sourceMappingURL=index.js.map