import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Boo Space",
  version: packageJson.version,
  copyright: `© ${currentYear}, Boo Space`,
  meta: {
    title: "Boo Space",
    description: "Studio Admin.",
  },
};
