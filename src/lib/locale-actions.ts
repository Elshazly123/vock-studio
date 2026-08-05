"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "./locale";
import type { Locale } from "./i18n";

export async function setLocale(locale: Locale) {
  cookies().set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
