/**
 * Windows / locked-down environments: skips @tailwindcss/vite (Oxide native binary).
 * Use: npm run dev:win
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, root, "VITE_");
  const envDefine = {};
  for (const [key, value] of Object.entries(loaded)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }
  return {
    define: envDefine,
    resolve: {
      alias: {
        "@": path.join(root, "src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    css: {
      postcss: path.join(root, "postcss.config.win.cjs"),
    },
    plugins: [
      {
        name: "tw3-styles-only",
        enforce: "pre",
        resolveId(source) {
          if (source.includes("styles.css") && !source.includes("styles.tw3.css")) {
            const query = source.includes("?") ? source.slice(source.indexOf("?")) : "";
            return path.join(root, "src/styles.tw3.css") + query;
          }
        },
      },
      tsconfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      react(),
    ],
    server: {
      host: true,
      port: 5173,
      strictPort: false,
    },
  };
});
