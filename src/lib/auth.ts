import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_localconnect_jwt_token_key_fyp_2026";
export const AUTH_COOKIE_NAME = "localconnect_token";

export interface UserSessionPayload {
  id: string;
  email: string;
  name: string;
  role: "customer" | "provider" | "admin";
  phone?: string;
  profileImage?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: UserSessionPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyJwtToken(token: string): UserSessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSessionPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwtToken(token);
  } catch (err) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): UserSessionPayload | null {
  // Check authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyJwtToken(token);
    if (decoded) return decoded;
  }

  // Fallback to cookie
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    return verifyJwtToken(cookieToken);
  }

  return null;
}

