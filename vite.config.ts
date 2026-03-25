/// <reference types="vitest/config" />
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { readFileSync } from "fs";

const certPath = path.resolve(__dirname, "../certs");

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: {
      key: readFileSync(path.join(certPath, "localhost-key.pem")),
      cert: readFileSync(path.join(certPath, "localhost.pem")),
    },
    host: true,
    // For Go API
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              proxyRes.headers["set-cookie"] = cookies.map((cookie) =>
                cookie.includes("Secure") ? cookie : cookie + "; Secure",
              );
            }
          });
        },
      },
    },
  },

  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@account": path.resolve(__dirname, "./src/features/account"),
      "@admin": path.resolve(__dirname, "./src/features/admin"),
      "@auth": path.resolve(__dirname, "./src/core/auth"),
      "@business": path.resolve(__dirname, "./src/features/business"),
      "@calendar": path.resolve(__dirname, "./src/features/calendar"),
      "@components": path.resolve(__dirname, "./src/core/components"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@dashboard": path.resolve(__dirname, "./src/features/dashboard"),
      "@event": path.resolve(__dirname, "./src/features/event"),
      "@layouts": path.resolve(__dirname, "./src/features/layouts"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@login": path.resolve(__dirname, "./src/features/login"),
      "@medical-history": path.resolve(__dirname, "./src/features/medical-history"),
      "@permissions": path.resolve(__dirname, "./src/features/permissions"),
      "@roles": path.resolve(__dirname, "./src/features/roles"),
      "@settings": path.resolve(__dirname, "./src/features/settings"),
      "@users": path.resolve(__dirname, "./src/features/users"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    exclude: ["**/node_modules/**", "**/login/__tests__/**"],
  },
});
