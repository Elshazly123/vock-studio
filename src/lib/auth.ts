import bcrypt from "bcryptjs";
import crypto from "crypto";

// ⚠️ SESSION_SECRET لازم يتحط كمتغير بيئة حقيقي وقوي وقت النشر الفعلي
// (مش نفس القيمة الافتراضية دي). لو اتسرب السيكريت، أي حد يقدر يزوّر جلسة أدمن.
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-only-secret-change-me";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export type SessionPayload = {
  id: string;
  name: string;
  username: string;
  canBookings: boolean;
  canSets: boolean;
  canPricing: boolean;
  canTeam: boolean;
  canSettings: boolean;
};

// جلسة بسيطة: JSON + توقيع HMAC، مخزنة في كوكي httpOnly.
// أبسط من نظام جلسات كامل (زي NextAuth) لكنها كافية وآمنة بما فيه الكفاية
// طول ما SESSION_SECRET قوي وسري. لمشروع بيكبر، الأفضل الانتقال لـ NextAuth
// أو Lucia مع جلسات في قاعدة البيانات قابلة للإلغاء الفوري.
export function signSession(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const base = Buffer.from(json).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(base).digest("base64url");
  return `${base}.${sig}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [base, sig] = token.split(".");
  if (!base || !sig) return null;

  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(base).digest("base64url");
  if (sig !== expectedSig) return null;

  try {
    const json = Buffer.from(base, "base64url").toString("utf-8");
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "vock_session";
