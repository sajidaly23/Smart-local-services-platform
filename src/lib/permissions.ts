import { NextResponse } from "next/server";
import { UserSessionPayload } from "./auth";

export function unauthorizedResponse(message = "Unauthorized: Please log in to continue") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden: Insufficient privileges") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function requireRole(
  user: UserSessionPayload | null,
  allowedRoles: ("customer" | "provider" | "admin")[]
): { authorized: boolean; errorResponse?: NextResponse } {
  if (!user) {
    return { authorized: false, errorResponse: unauthorizedResponse() };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      errorResponse: forbiddenResponse(
        `This resource requires one of the following roles: ${allowedRoles.join(", ")}`
      ),
    };
  }

  return { authorized: true };
}

