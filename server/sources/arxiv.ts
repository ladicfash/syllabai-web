import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchText, normalizeWhitespace, stripHtml } from "./types";

const BASE = "https://export.arxiv.org/api/query";

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function tag(xml: string, name: string) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? stripHtml(decodeXml(m[1])) : undefined;
}

function entries(xml: string) {
  return Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)).map((m) => m[1]);
}

function authors(entry: string) {
  return Array.from(entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi))
    .map((m) => stripHtml(decodeXml(m[1])))
    .filter(Boolean);
}

function arxivIdFromUrl(url?: string) {
  return url?.split("/abs/")[1]?.trim() || url?.split("/pdf/")[1]?.replace(/\.pdf$/, "").trim();
}

function mapEntry(entry: string): SourceSearchResult {
  const idUrl = tag(entry, "id");
  const externalId = arxivIdFromUrl(idUrl) || idUrl || "unknown";
  const categories = Array.from(entry.matchAll(/<category[^>]+term="([^"]+)"/gi)).map((m) => m[1]);
  return {
    source: "arxiv",
    externalId,
    title: normalizeWhitespace(tag(entry, "title")) || "Untitled arXiv paper",
    authors: authors(entry),
    abstract: normalizeWhitespace(tag(entry, "summary")),
    url: idUrl,
    publishedDate: tag(entry, "published")?.slice(0, 10),
    license: tag(entry, "arxiv:license") || "arXiv terms/license vary by paper",
    isOpenAccess: true,
    contentType: "preprint",
    tags: ["preprint", ...categories].filter(Boolean),
    metadata: { arxivId: externalId, categories, pdfUrl: idUrl?.replace("/abs/", "/pdf/") + ".pdf" },
  };
}

export const arxivConnector: SourceConnector = {
  id: "arxiv",
  label: "arXiv",
  fields: ["general", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const xml = await fetchText(`${BASE}?search_query=all:${encodeURIComponent(input.query)}&start=0&max_results=${limit}`);
    return entries(xml).map(mapEntry);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const xml = await fetchText(`${BASE}?id_list=${encodeURIComponent(externalId)}&max_results=1`);
    const entry = entries(xml)[0];
    if (!entry) throw new Error("arXiv item not found");
    const item = mapEntry(entry);
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
