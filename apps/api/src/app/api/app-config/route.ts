import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { AppConfig } from "@headless/database";
import { AppConfigInputSchema } from "@headless/types";

export async function GET(req: NextRequest) {
  try {
    await initApi();
    const { searchParams } = new URL(req.url);
    const packageName = searchParams.get("packageName");

    if (packageName) {
      // Public route for specific client app by package name
      const config = await AppConfig.findOne({ packageName });
      if (!config) {
        // Return default fallback config for app stability
        return successResponse({
          packageName,
          admob: {
            appId: "",
            bannerAdUnitId: "",
            interstitialAdUnitId: "",
            rewardedAdUnitId: "",
            nativeAdUnitId: "",
          },
          applovin: {
            sdkKey: "",
            bannerAdUnitId: "",
            interstitialAdUnitId: "",
            rewardedAdUnitId: "",
            nativeAdUnitId: "",
          },
          ads: {
            bannerEnabled: false,
            interstitialEnabled: false,
            rewardedEnabled: false,
            nativeEnabled: false,
            interstitialInterval: 5,
            adProvider: "none",
          },
          promoBanner: {
            enabled: false,
            image: "",
            targetUrl: "",
          },
          appUpdate: {
            forceUpdate: false,
            minimumVersion: "1.0.0",
            updateUrl: "",
          },
          safeMode: false
        });
      }
      return successResponse(config);
    }

    // Admin only - list all app configurations
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const configs = await AppConfig.find().sort({ createdAt: -1 });
    return successResponse(configs);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const body = await req.json();
    const parsed = AppConfigInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    // Check if packageName already exists
    const existing = await AppConfig.findOne({ packageName: parsed.data.packageName });
    if (existing) {
      return errorResponse("Configuration for this package name already exists", 400);
    }

    const config = await AppConfig.create(parsed.data);
    return successResponse(config, "App configuration created successfully", 201);
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
    const { id, ...data } = body;

    if (!id) {
      return errorResponse("Configuration ID is required", 400);
    }

    const config = await AppConfig.findById(id);
    if (!config) {
      return errorResponse("App configuration not found", 404);
    }

    // If packageName is changed, verify uniqueness
    if (data.packageName && data.packageName !== config.packageName) {
      const existing = await AppConfig.findOne({ packageName: data.packageName });
      if (existing) {
        return errorResponse("Configuration for this package name already exists", 400);
      }
    }

    Object.assign(config, data);
    await config.save();

    return successResponse(config, "App configuration updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Configuration ID is required", 400);
    }

    const config = await AppConfig.findById(id);
    if (!config) {
      return errorResponse("App configuration not found", 404);
    }

    // Hard delete for app config is fine since they are small configs
    await AppConfig.findByIdAndDelete(id);

    return successResponse(null, "App configuration deleted successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
