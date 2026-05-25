import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const deployTarget = process.env.DEPLOY_TARGET ?? (process.env.VERCEL ? "vercel" : "cloudflare");

export default defineConfig(async ({ mode, command }) => {
  const loaded = loadEnv(mode, root, "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loaded)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const plugins = [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    react(),
    tailwindcss(),
  ];

  if (command === "build") {
    if (deployTarget === "vercel") {
      plugins.push(nitro({ preset: "vercel" }));
    } else {
      const cloudflare = (await import("@cloudflare/vite-plugin")).default;
      plugins.push(cloudflare());
    }
  }

  return {
    define: envDefine,
    resolve: {
      alias: { "@": path.join(root, "src") },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    plugins,
    server: {
      host: true,
      port: 5173,
      strictPort: false,
    },
  };
});
