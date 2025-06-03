import { defineConfig } from "vitepress";
import nav from "./nav.mts";
import sidebar from "./sidebar.mjs";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Project",
  description: "A VitePress Site",
  srcDir: "docs",
  base:'/My-blog/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,

    sidebar: sidebar,
    outline: false,
    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
