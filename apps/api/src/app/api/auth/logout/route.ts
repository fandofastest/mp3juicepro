import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse, authenticateRequest } from "../../../../lib/api-helper";
import { AuditLog } from "@headless/database";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const user = await authenticateRequest(req);

    if (user) {
      await AuditLog.create({
        userId: user.userId,
        action: "logout",
        resource: "auth",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    }

    return successResponse(null, "Logout successful");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
