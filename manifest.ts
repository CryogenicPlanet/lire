import { ManifestV3Export } from "@crxjs/vite-plugin";

const isDev =
  import.meta?.env?.MODE === "development" ||
  process.env.NODE_ENV === "development";

export const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: isDev ? "lire-dev" : "lire",
  version: "1.0",
  description:
    "A free open-source TTS reader using OpenAI, will read out a page and highlight the text it is reading",
  icons: {
    "16": "images/icon-16.png",
    "32": "images/icon-32.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png",
  },
  action: {
    default_icon: "images/icon-32.png",
    default_title: "Lire",
    default_popup: "src/pages/popup/index.html",
  },
  permissions: ["activeTab", "storage"],
  host_permissions: ["https://api.openai.com/*"],
  background: {
    service_worker: "src/pages/background/background.ts",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "file://*/*.pdf"],
      js: ["src/pages/content-script/content.tsx"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [],
      matches: [],
    },
  ],
};
