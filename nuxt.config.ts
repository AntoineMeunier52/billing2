// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    "@nuxt/content",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/ui",
    "@prisma/nuxt",
    "nuxt-authorization",
    "nuxt-auth-utils",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@compodium/nuxt",
  ],
  experimental: {
    componentIslands: true,
  },
  runtimeConfig: {
    password: "",
    name: "billing-session",
    cookie: {
      maxAge: 60 * 24 * 7, //7 days
    },
  },

  nitro: {
    scheduledTasks: {
      "0 3 1 * *": ["cdr:read"],
      "0 4 1 * *": ["cdr:pdf"],
    },
  },
});
