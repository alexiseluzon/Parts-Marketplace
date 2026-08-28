import { Request } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Supabase issues short-lived JWTs (RS256) via GoTrue. The frontend sends
// the access_token as a Bearer header; we verify it against Supabase's
// published JWKS rather than sharing a symmetric secret.
const JWKS = createRemoteJWKSet(new URL(process.env.SUPABASE_JWKS_URL!));

export interface AuthContext {
  userId: string | null;
}

// Verifies the Supabase access token from the Authorization header and
// returns the user's id (== auth.users.id == profiles.id). Returns null
// for missing/expired/invalid tokens rather than throwing, so callers can
// decide per-resolver whether auth is required.
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length);
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.SUPABASE_URL}/auth/v1`,
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null; // expired/invalid/malformed => treat as logged out
  }
}

export function requireAuth(userId: string | null): asserts userId is string {
  if (!userId) {
    throw new Error("UNAUTHENTICATED: you must be logged in");
  }
}
