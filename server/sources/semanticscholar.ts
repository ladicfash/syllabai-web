import { buildCitations, buildImportText } from "./citations";
import { extractDoi, lookupOpenAccessByDoi } from "./doi";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, stripHtml } from "./types";

const BASE = "https://api.semanticscholar.org/graph/v1";
const FIELDS = "paperId,title,abstract,authors,year,publicationDate,url,venue,externalIds,isOpenAccess,openAccessPdf,fieldsOfStudy,publicationTypes";

type S2Paper = {
  paperId: string;
  title?: string;
  abstract?: string;
  authors?: { name: string }[];
  year?: number;
  publicationDate?: string;
  url?: string;
  venue?: string;
  externalIds?: Record<string, string>;
  isOpenAccess?: boolean;
  openAccessPdf?: { url?: string; status?: string };
  fieldsOfStudy?: string[];
  publicationTypes?: string[];
};
type S2Search = { data?: S2Paper[] };

function headers() {
  return process.env.SEMANTIC_SCHOLAR_API_KEY ? { "x-api-key": process.env.SEMANTIC_SCHOLAR_API_KEY } : undefined;
}

async function enrichWithDoi(item: SourceSearchResult) {
  const doi = extractDoi(item.metadata?.doi, item.url, item.externalId);
  const oa = await lookupOpenAccessByDoi(doi);
  return {
    ...item,
    fullTextUrl: item.fullTextUrl || oa.fullTextUrl,
    isOpenAccess: item.isOpenAccess || oa.isOpenAccess,
    license: item.license || oa.license,
    tags: [...(item.tags ?? []), ...((oa.tags as string[] | undefined) ?? [])].filter(Boolean),
    metadata: { ...(item.metadata ?? {}), ...(oa.metadata ?? {}) },
  };
}

function mapPaper(paper: S2Paper): SourceSearchResult {
  const doi = paper.externalIds?.DOI;
  return {
    source: "semanticscholar",
    externalId: paper.paperId,
    title: stripHtml(paper.title) || "Untitled Semantic Scholar paper",
    authors: paper.authors?.map((a) => a.name).filter(Boolean),
    abstract: stripHtml(paper.abstract),
    url: paper.url || (doi ? `https://doi.org/${doi}` : undefined),
    fullTextUrl: paper.openAccessPdf?.url,
    publishedDate: paper.publicationDate || (paper.year ? String(paper.year) : undefined),
    license: paper.openAccessPdf?.status,
    isOpenAccess: paper.isOpenAccess,
    contentType: "article",
    tags: ["Semantic Scholar", paper.venue, ...(paper.fieldsOfStudy ?? []).slice(0, 4), ...(paper.publicationTypes ?? []).slice(0, 2)].filter(Boolean) as string[],
    metadata: { paperId: paper.paperId, doi, venue: paper.venue, externalIds: paper.externalIds, openAccessPdf: paper.openAccessPdf },
  };
}

export const semanticScholarConnector: SourceConnector = {
  id: "semanticscholar",
  label: "Semantic Scholar",
  fields: ["general", "medicine", "law", "all"],
  requiresApiKey: false,
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const data = await fetchJson<S2Search>(`${BASE}/paper/search?query=${encodeURIComponent(input.query)}&limit=${limit}&fields=${FIELDS}`, { headers: headers() });
    return Promise.all((data.data ?? []).map((paper) => enrichWithDoi(mapPaper(paper))));
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const paper = await fetchJson<S2Paper>(`${BASE}/paper/${encodeURIComponent(externalId)}?fields=${FIELDS}`, { headers: headers() });
    const item = await enrichWithDoi(mapPaper(paper));
    const citation = buildCitations(item);
    const fullTextLine = item.fullTextUrl ? `\n\n## Open-access full-text location\n${item.fullTextUrl}\n` : "";
    return { ...item, citation, importedText: `${buildImportText(item, citation)}${fullTextLine}` };
  },
};
