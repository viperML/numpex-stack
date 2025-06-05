import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

export default defineConfig({
  base: "/numpex-stack/",
  trailingSlash: "ignore",
  output: "server",

  server: {
    host: true,
    allowedHosts: true,
    port: 8080,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: "standalone",
  }),
});
