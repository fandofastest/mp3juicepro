"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const api_helper_1 = require("../../../../lib/api-helper");
async function POST(req) {
    try {
        await (0, api_helper_1.initApi)();
        const userPayload = await (0, api_helper_1.authenticateRequest)(req);
        if (!userPayload) {
            return (0, api_helper_1.errorResponse)("Unauthorized", 401);
        }
        const body = await req.json();
        const { provider, key } = body;
        if (!key) {
            return (0, api_helper_1.errorResponse)("API Key is required to run connection test", 400);
        }
        if (provider === "youtube") {
            try {
                // Run a lightweight test request against Google servers
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test&key=${key}`);
                const data = await response.json();
                if (response.ok) {
                    return (0, api_helper_1.successResponse)({ valid: true }, "YouTube API Key is VALID and working!");
                }
                else {
                    const errorMsg = data.error?.message || "Google API key error";
                    return (0, api_helper_1.errorResponse)(`YouTube Key rejected: ${errorMsg}`, 400);
                }
            }
            catch (err) {
                return (0, api_helper_1.errorResponse)("Failed to establish network connection to Google servers.", 500);
            }
        }
        if (provider === "rapidapi") {
            try {
                // Run a lightweight test request against RapidAPI servers
                const response = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=dQw4w9WgXcQ`, {
                    headers: {
                        "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
                        "x-rapidapi-key": key,
                    },
                });
                const data = await response.json();
                if (response.ok && (data.status === "ok" || data.msg === "success" || data.title)) {
                    return (0, api_helper_1.successResponse)({ valid: true }, "RapidAPI Key is VALID and working!");
                }
                else {
                    const errorMsg = data.message || "RapidAPI key error";
                    return (0, api_helper_1.errorResponse)(`RapidAPI Key rejected: ${errorMsg}`, 400);
                }
            }
            catch (err) {
                return (0, api_helper_1.errorResponse)("Failed to establish network connection to RapidAPI servers.", 500);
            }
        }
        return (0, api_helper_1.errorResponse)(`Provider ${provider} is not supported for verification`, 400);
    }
    catch (error) {
        return (0, api_helper_1.errorResponse)(error.message || "Internal server error", 500);
    }
}
//# sourceMappingURL=route.js.map