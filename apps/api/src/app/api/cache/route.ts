import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest, authorizeRoles } from "../../../lib/api-helper";
import { CacheService } from "@headless/utils";

export async function DELETE(req: NextRequest) {
  try {
    await initApi();
    const userPayload = await authenticateRequest(req);
    if (!userPayload || !authorizeRoles(userPayload.role, "Admin")) {
      return errorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const pattern = searchParams.get("pattern") || "*";

    await CacheService.clearPattern(pattern);

    return successResponse(null, `Cache keys matching pattern '${pattern}' cleared successfully`);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
