import { cookies } from "next/headers";
import type { Locale } from "./i18n";

export const LOCALE_COOKIE = "vock_locale";

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value === "ar" ? "ar" : "en"; // الإنجليزي هو الافتراضي
}
