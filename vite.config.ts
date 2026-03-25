import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "logo.png"],
        manifest: {
          name: "JalRakshak 2.0",
          short_name: "JalRakshak",
          description: "AI-Powered Urban Flood Prediction & Relief Platform",
          theme_color: "#0B3A68",
          icons: [
            {
              src: "logo.png",
              sizes: "192x192 512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      target: "es2020",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("react-leaflet") || id.includes("leaflet"))
              return "leaflet";
            if (id.includes("firebase")) return "firebase";
            if (id.includes("recharts") || id.includes("d3")) return "charts";
            if (id.includes("motion")) return "motion";
            if (id.includes("lucide-react")) return "icons";
            if (
              id.includes("@google/genai") ||
              id.includes("@google/earthengine")
            )
              return "ai";
            if (id.includes("three") || id.includes("@react-three"))
              return "three";
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
    },
  };
});
