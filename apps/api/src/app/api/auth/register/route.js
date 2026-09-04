"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const api_helper_1 = require("../../../../lib/api-helper");
const database_1 = require("@headless/database");
const types_1 = require("@headless/types");
const auth_1 = require("@headless/auth");
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const body = await req.json();
        // Input Validation
        const parsed = types_1.RegisterInputSchema.safeParse(body);
        if (!parsed.success) {
            return (0, api_helper_1.errorResponse)("Validation error", 400, parsed.error.errors);
        }
        const { username, displayName, email, password, country, language } = parsed.data;
        // Check if email or username already exists
        const duplicate = await database_1.User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
        });
        if (duplicate) {
            return (0, api_helper_1.errorResponse)("Username or email already exists", 409);
        }
        const passwordHash = await (0, auth_1.hashPassword)(password);
        const user = await database_1.User.create({
            username: username.toLowerCase(),
            displayName,
            email: email.toLowerCase(),
            passwordHash,
            role: "User",
            status: "active",
            verified: false,
            premium: false,
            country: country || "US",
            language: language || "en",
        });
        const userProfile = {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            status: user.status,
            premium: user.premium,
            verified: user.verified,
            country: user.country,
            language: user.language,
            createdAt: user.createdAt,
        };
        return (0, api_helper_1.successResponse)(userProfile, "Registration successful", 201);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map