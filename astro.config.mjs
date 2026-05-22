// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://trailerparkpilot.com",
  base: "/",
  trailingSlash: "ignore",

  vite: {
    plugins: [tailwindcss()],
  },
});