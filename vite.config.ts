import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ib-econ-atlas/",
  plugins: [react()],
  build: {
    sourcemap: true,
  },
});

