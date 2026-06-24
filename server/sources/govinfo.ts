import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, stripHtml } from "./types";

const BASE = "https://api.govinfo.gov";

type GovInfoSearchResult = {
  packageId?: string;
  title?: string;
  granuleTitle?: string;
  collectionCode?: string;
  collectionName?: string;
  dateIssued?: string;
  lastModified?: string;
  governmentAuthor?: string[];
  download?: { txtLink?: string; pdfLink?: string; modsLink?: string; premisLink?: string };
  detailsLink?: string;
};
type GovInfoSearchResponse = { results?: GovInfoSearchResult[] };
type GovInfoSummary = GovInfoSearchResult & { docClass?: string; category?: string; pages?: string; branch?: string };

function apiKey() {
  return process.env.GOVINFO_API_KEY;
}

function requireKey() {
  const key = apiKey();
  if (!key) throw new Error("GovInfo integration requires a free GOVINFO_API_KEY environment variable.");
  return key;
}

function mapResult(result: GovInfoSearchResult): SourceSearchResult {
  const id = result.packageId ?? result.detailsLink?.split("/").filter(Boolean).pop() ?? "unknown";
  return {
    source: "govinfo",
    externalId: id,
    title: stripHtml(result.title || result.granuleTitle) || "Untitled GovInfo document",
    authors: result.governmentAuthor,
    abstract: stripHtml([result.collectionName, result.collectionCode].filter(Boolean).join(" · ")),
    url: result.detailsLink || `https://www.govinfo.gov/app/details/${id}`,
    fullTextUrl: result.download?.txtLink || result.download?.pdfLink,
    publishedDate: result.dateIssued || result.lastModified,
    license: "U.S. government public information; check item-specific restrictions",
    isOpenAccess: true,
    contentType: "dataset",
    tags: ["government", "GovInfo", result.collectionName, result.collectionCode].filter(Boolean) as string[],
    metadata: { packageId: id, collectionCode: result.collectionCode, download: result.download, detailsLink: result.detailsLink },
  };
}

export const govInfoConnector: SourceConnector = {
  id: "govinfo",
  label: "GovInfo",
  fields: ["law", "general", "all"],
  requiresApiKey: true,
  async search(input) {
    const key = requireKey();
    const limit = Math.min(input.limit ?? 10, 25);
    const res = await fetch(`${BASE}/search?api_key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: input.query, pageSize: limit, offsetMark: "*" }),
    });
    if (!res.ok) throw new Error(`GovInfo search failed (${res.status})`);
    const data = (await res.json()) as GovInfoSearchResponse;
    return (data.results ?? []).map(mapResult);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const key = requireKey();
    let item: SourceSearchResult;
    try {
      const summary = await fetchJson<GovInfoSummary>(`${BASE}/packages/${encodeURIComponent(externalId)}/summary?api_key=${encodeURIComponent(key)}`);
      item = mapResult(summary);
    } catch {
      item = {
        source: "govinfo",
        externalId,
        title: `GovInfo package ${externalId}`,
        url: `https://www.govinfo.gov/app/details/${externalId}`,
        license: "U.S. government public information; check item-specific restrictions",
        isOpenAccess: true,
        contentType: "dataset",
        tags: ["government", "GovInfo"],
        metadata: { packageId: externalId },
      };
    }
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
