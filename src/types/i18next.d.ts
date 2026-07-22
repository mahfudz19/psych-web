import "i18next";
import common from "../i18n/locales/id/common.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
    };
  }
}
