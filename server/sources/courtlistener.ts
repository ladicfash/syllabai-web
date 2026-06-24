import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, stripHtml } from "./types";

const BASE = "https://www.courtlistener.com/api/rest/v4/search/";

type CourtListenerResult = {
  id?: number;
  cluster_id?: number;
  caseName?: string;
  caseNameFull?: string;
  absolute_url?: string;
  court?: string;
  court_citation_string?: string;
  dateFiled?: string;
  snippet?: string;
  status?: string;
  citation?: string[];
};
type CourtListenerResponse = { results?: CourtListenerResult[] };

function mapCase(r: CourtListenerResult): SourceSearchResult {
  const id = String(r.cluster_id ?? r.id ?? "unknown");
  const url = r.absolute_url?.startsWith("http") ? r.absolute_url : `https://www.courtlistener.com${r.absolute_url ?? `/opinion/${id}/`}`;
  return {
    source: "courtlistener",
    externalId: id,
    title: stripHtml(r.caseNameFull || r.caseName) || "Untitled case",
    authors: [r.court].filter(Boolean) as string[],
    abstract: stripHtml(r.snippet),
    url,
    publishedDate: r.dateFiled,
    license: "CourtListener public legal metadata/opinion access; check individual source/court restrictions",
    isOpenAccess: true,
    contentType: "case",
    tags: ["case law", r.court, r.status].filter(Boolean) as string[],
    metadata: { clusterId: r.cluster_id, opinionId: r.id, court: r.court, citation: r.citation, courtCitation: r.court_citation_string },
  };
}

export const courtListenerConnector: SourceConnector = {
  id: "courtlistener",
  label: "CourtListener",
  fields: ["law", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const data = await fetchJson<CourtListenerResponse>(`${BASE}?q=${encodeURIComponent(input.query)}&type=o&order_by=score%20desc`);
    return (data.results ?? []).slice(0, limit).map(mapCase);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const data = await fetchJson<CourtListenerResponse>(`${BASE}?q=${encodeURIComponent(externalId)}&type=o`);
    const raw = (data.results ?? []).find((r) => String(r.cluster_id ?? r.id) === externalId) ?? data.results?.[0];
    if (!raw) throw new Error("CourtListener case not found");
    const item = mapCase(raw);
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
