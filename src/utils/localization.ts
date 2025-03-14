import { configureLocalization } from "@lit/localize";
import { sourceLocale, targetLocales } from "../generated/locale-codes.js";

// ✅ Explicitly map locale files
const localeImports = {
  de: () => import("../generated/locales/de.js"),
};

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale) => localeImports[locale]?.() ?? Promise.resolve(),
});
