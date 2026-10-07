import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";
// @ts-expect-error Shared JavaScript renderer has no TypeScript declarations.
import { pages, render, appHtml, notFound } from "./content/render.mjs";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "starmora-public-pages",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const path = (request.url || "/").split("?")[0];
          if (path === "/") {
            response.writeHead(302, { Location: "/tr/" });
            response.end();
            return;
          }
          if (!path.startsWith("/tr") && !path.startsWith("/en")) {
            next();
            return;
          }
          try {
            if (
              !path.endsWith("/") &&
              pages.some((p: { path: { tr: string; en: string } }) =>
                Object.values(p.path).includes(path + "/"),
              )
            ) {
              response.writeHead(301, { Location: path + "/" });
              response.end();
              return;
            }
            const lang = path.startsWith("/en") ? "en" : "tr";
            const page = pages.find(
              (p: { path: { tr: string; en: string } }) =>
                p.path[lang] === path,
            );
            let html: string;
            if (path === "/tr/harita/" || path === "/en/chart/")
              html = appHtml(
                await readFile(
                  new URL("./index.html", import.meta.url),
                  "utf8",
                ),
                lang,
              );
            else if (page) html = render(page, lang);
            else {
              response.statusCode = 404;
              html = notFound(lang);
            }
            html = await server.transformIndexHtml(path, html);
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.setHeader("Content-Language", lang);
            response.end(html);
          } catch (error) {
            next(error as Error);
          }
        });
      },
    },
  ],
  server: {
    proxy: { "/api": { target: "http://127.0.0.1:8080", changeOrigin: false } },
  },
});
