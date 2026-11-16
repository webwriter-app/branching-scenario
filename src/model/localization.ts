import { sourceLocale, targetLocales } from "../../localization/generated/locale-codes.js";

/** Options of `localizer()` for the catalogs that `lit-localize` generates into `localization/generated/locales`. */
export const localizeOptions = {
  sourceLocale,
  targetLocales,
  load: (locale: string) => import(`../../localization/generated/locales/${locale}.ts`),
};
