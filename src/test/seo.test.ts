import { describe, expect, it } from "vitest";
import { pageHead, searchPages, siteCreator, type SearchPath } from "@/lib/seo";

describe("Search attribution", () => {
  it("credits Youssof Moussa as website creator, separately from the scientific author", () => {
    expect(siteCreator.name).toBe("Youssof Moussa");
    const head = pageHead("/traduction");
    const graph = JSON.parse(head.scripts[0]?.children ?? "{}")["@graph"];
    expect(graph[0].creator.name).toBe("Youssof Moussa");
    expect(graph[1].author.name).toBe("Dr. Mohamad DIAB");
  });
  it("gives each page French and English canonicals on the Vercel domain", () => {
    for (const path of Object.keys(searchPages) as SearchPath[]) {
      const fr = pageHead(path, "fr").links;
      const en = pageHead(path, "en").links;
      expect(fr[0]).toEqual({ rel: "canonical", href: `https://hereditybydiab.vercel.app${path}` });
      expect(en[0]).toEqual({ rel: "canonical", href: `https://hereditybydiab.vercel.app${path}?lang=en` });
    }
  });
});