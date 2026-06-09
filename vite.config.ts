import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"

// https://vite.dev/config/
export default defineConfig({
  // Relative assets keep the build portable for GitHub Pages project sites.
  base: "./",
  plugins: [react(), powerApps()],
});
