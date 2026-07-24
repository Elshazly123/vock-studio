import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME, type SessionPayload } from "./auth";

export function getCurrentUser(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySession(token);
}
