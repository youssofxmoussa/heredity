import { createFileRoute } from "@tanstack/react-router";
import { localizedURL } from "@/lib/site";

const paths = ["/", "/griffith", "/hershey-chase", "/structure", "/replication", "/transcription", "/traduction"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const entries = paths
          .flatMap((p) =>
            (["fr", "en"] as const).map(
              (lang) => `  <url>
    <loc>${localizedURL(p, lang)}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${localizedURL(p, "fr")}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${localizedURL(p, "en").replace("&", "&amp;")}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedURL(p, "fr")}"/>
    <priority>${p === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
            ),
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
