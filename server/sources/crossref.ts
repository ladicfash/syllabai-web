import { buildCitations, buildImportText } from "./citations";
import { lookupOpenAccessByDoi } from "./doi";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, normalizeWhitespace, stripHtml } from "./types";

type CrossrefWork = {
  DOI?: string;
  title?: string[];
  subtitle?: string[];
  abstract?: string;
  author?: { given?: string; family?: string; name?: string }[];
  issued?: { "date-parts"?: number[][] };
  published?: { "date-parts"?: number[][] };
  type?: string;
  URL?: string;
  publisher?: string;
  license?: { URL?: string }[];
  subject?: string[];
  "container-title"?: string[];
};
type CrossrefResponse = { message?: { items?: CrossrefWork[] } };
type CrossrefSingle = { message?: CrossrefWork };

const BASE = "https://api.crossref.org/works";

function dateFrom(work: CrossrefWork) {
  const parts = work.published?.["date-parts"]?.[0] || work.issued?.["date-parts"]?.[0];
  return parts?.filter(Boolean).join("-");
}

function authorName(a: { given?: string; family?: string; name?: string }) {
  return a.name || [a.given, a.family].filter(Boolean).join(" ").trim();
}

async function mapWork(work: CrossrefWork): Promise<SourceSearchResult> {
  const doi = work.DOI;
  const oa = await lookupOpenAccessByDoi(doi);
  return {
    source: "crossref",
    externalId: doi || work.URL || normalizeWhitespace(work.title?.[0]).slice(0, 120),
    title: stripHtml([...(work.title ?? []), ...(work.subtitle ?? [])].join(": ")) || "Untitled Crossref record",
    authors: work.author?.map(authorName).filter(Boolean),
    abstract: stripHtml(work.abstract),
    url: work.URL || (doi ? `https://doi.org/${doi}` : undefined),
    fullTextUrl: oa.fullTextUrl,
    publishedDate: dateFrom(work),
    license: work.license?.[0]?.URL || oa.license || "Crossref metadata is generally open; full-text license varies",
    isOpenAccess: oa.isOpenAccess,
    contentType: work.type === "book" || work.type === "book-chapter" ? "book" : "article",
    tags: ["Crossref", work.type, work.publisher, ...(work.subject ?? []).slice(0, 3)].filter(Boolean) as string[],
    metadata: { doi, publisher: work.publisher, type: work.type, journal: work["container-title"]?.[0], ...(oa.metadata ?? {}) },
  };
}

export const crossrefConnector: SourceConnector = {
  id: "crossref",
  label: "Crossref",
  fields: ["general", "medicine", "law", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const data = await fetchJson<CrossrefResponse>(`${BASE}?query=${encodeURIComponent(input.query)}&rows=${limit}&mailto=hello@syllabai.app`);
    return Promise.all((data.message?.items ?? []).map(mapWork));
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const data = await fetchJson<CrossrefSingle>(`${BASE}/${encodeURIComponent(externalId)}?mailto=hello@syllabai.app`);
    if (!data.message) throw new Error("Crossref item not found");
    const item = await mapWork(data.message);
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
