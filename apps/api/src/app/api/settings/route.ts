import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { SystemSettings } from "@headless/database";
import { SystemSettingsInputSchema } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    let settings = await SystemSettings.findOne();

    if (!settings) {
      // Create defaults
      settings = await SystemSettings.create({
        appName: "MP3Juice Pro",
        primaryColor: "#1DB954",
        secondaryColor: "#191414",
        theme: "dark",
        language: "en",
        country: "US",
        searchLimit: 20,
        cacheTtl: 3600,
        maintenanceMode: false,
        minimumAppVersion: "1.0.0",
        apiKeys: {},
      });
    }

    return successResponse(settings);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const body = await req.json();
    const parsed = SystemSettingsInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings(parsed.data);
    } else {
      Object.assign(settings, parsed.data);
    }

    await settings.save();
    return successResponse(settings, "Settings updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
