import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "session_token";
const TOKEN_TTL = "2h";

export interface AuthContext {
  userId: string | null;
  res: Response;
}

// Sign a JWT and set it as an httpOnly cookie.
// httpOnly => JS on the client can't read it (mitigates XSS token theft).
// sameSite=strict => cookie won't be sent on cross-site requests (mitigates CSRF).
export function issueSession(res: Response, userId: string) {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 2 * 60 * 60 * 1000,
  });
}

export function clearSession(res: Response) {
  res.clearCookie(COOKIE_NAME);
}

// Reads the cookie off the incoming request and resolves the userId.
// This becomes the GraphQL context on every request.
export function getUserIdFromRequest(req: Request): string | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return payload.sub;
  } catch {
    return null; // expired/invalid token => treat as logged out
  }
}

export function requireAuth(userId: string | null): asserts userId is string {
  if (!userId) {
    throw new Error("UNAUTHENTICATED: you must be logged in");
  }
}
