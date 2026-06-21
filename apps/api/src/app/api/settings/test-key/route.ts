import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../../lib/api-helper";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { provider, key } = body;

    if (!key) {
      return errorResponse("API Key is required to run connection test", 400);
    }

    if (provider === "youtube") {
      try {
        // Run a lightweight test request against Google servers
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test&key=${key}`
        );
        const data = await response.json();

        if (response.ok) {
          return successResponse({ valid: true }, "YouTube API Key is VALID and working!");
        } else {
          const errorMsg = data.error?.message || "Google API key error";
          return errorResponse(`YouTube Key rejected: ${errorMsg}`, 400);
        }
      } catch (err: any) {
        return errorResponse("Failed to establish network connection to Google servers.", 500);
      }
    }

    if (provider === "rapidapi") {
      try {
        // Run a lightweight test request against RapidAPI servers
        const response = await fetch(
          `https://youtube-mp36.p.rapidapi.com/dl?id=dQw4w9WgXcQ`,
          {
            headers: {
              "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
              "x-rapidapi-key": key,
            },
          }
        );
        const data = await response.json();

        if (response.ok && (data.status === "ok" || data.msg === "success" || data.title)) {
          return successResponse({ valid: true }, "RapidAPI Key is VALID and working!");
        } else {
          const errorMsg = data.message || "RapidAPI key error";
          return errorResponse(`RapidAPI Key rejected: ${errorMsg}`, 400);
        }
      } catch (err: any) {
        return errorResponse("Failed to establish network connection to RapidAPI servers.", 500);
      }
    }

    return errorResponse(`Provider ${provider} is not supported for verification`, 400);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
