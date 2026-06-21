import { NextRequest } from "next/server";
import { initApi, successResponse, errorResponse } from "../../../../lib/api-helper";
import { User } from "@headless/database";
import { RegisterInputSchema } from "@headless/types";
import { hashPassword } from "@headless/auth";

export async function POST(req: NextRequest) {
  try {
    await initApi();
    const body = await req.json();

    // Input Validation
    const parsed = RegisterInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const { username, displayName, email, password, country, language } = parsed.data;

    // Check if email or username already exists
    const duplicate = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (duplicate) {
      return errorResponse("Username or email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
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

    return successResponse(userProfile, "Registration successful", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}
