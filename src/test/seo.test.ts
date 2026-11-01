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
  it("keeps page identities self-referencing without inventing a public domain", () => {
    for (const path of Object.keys(searchPages) as SearchPath[]) {
      const head = pageHead(path);
      expect(head.links).toEqual([{ rel: "canonical", href: path }]);
      expect(head.meta.find(meta => "property" in meta && meta.property === "og:url")?.content).toBe(path);
    }
  });
});