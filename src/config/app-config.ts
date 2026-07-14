import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Boo Space Admin",
  version: packageJson.version,
  copyright: `© ${currentYear}, Boo Space Admin.`,
  meta: {
    title: "Boo Space Admin",
    description: "Studio Admin.",
  },
};
