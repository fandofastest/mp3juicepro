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
      // 1. Attempt to fetch live central remote config from newconfig dashboard
      try {
        const newconfigUrl = process.env.NEWCONFIG_API_URL || "https://newconfig-bmuj.vercel.app";
        const res = await fetch(`${newconfigUrl}/api/config/${encodeURIComponent(packageName)}`, {
          cache: "no-store",
          headers: {
            "x-forwarded-for": req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
            "user-agent": req.headers.get("user-agent") || "",
          },
        });
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && !remoteData.error) {
            return successResponse(remoteData);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch central remote config, falling back to local DB:", err.message);
      }

      // 2. Fallback to local database AppConfig if remote config is unreachable
      const config = await AppConfig.findOne({ packageName });
      if (!config) {
        return successResponse({
          packageName,
          admob: {
            appId: "",
            bannerAdUnitId: "",
            interstitialAdUnitId: "",
            interSplashAdUnitId: "",
            rewardedAdUnitId: "",
            nativeAdUnitId: "",
          },
          applovin: {
            sdkKey: "",
            bannerAdUnitId: "",
            interstitialAdUnitId: "",
            interSplashAdUnitId: "",
            rewardedAdUnitId: "",
            nativeAdUnitId: "",
          },
          ads: {
            bannerEnabled: false,
            interstitialEnabled: false,
            interSplashEnabled: false,
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

    await AppConfig.findByIdAndDelete(id);

    return successResponse(null, "App configuration deleted successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
