import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, normalizeWhitespace, stripHtml } from "./types";

const BASE = "https://api.openalex.org/works";

type OpenAlexWork = {
  id: string;
  doi?: string;
  display_name: string;
  publication_year?: number;
  publication_date?: string;
  type?: string;
  open_access?: { is_oa?: boolean; oa_url?: string; oa_status?: string };
  primary_location?: { landing_page_url?: string; pdf_url?: string; source?: { display_name?: string } };
  authorships?: { author?: { display_name?: string } }[];
  abstract_inverted_index?: Record<string, number[]>;
  concepts?: { display_name: string; score: number }[];
};

type OpenAlexResponse = { results: OpenAlexWork[] };

function reconstructAbstract(index?: Record<string, number[]>) {
  if (!index) return undefined;
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) words[pos] = word;
  }
  return normalizeWhitespace(words.join(" "));
}

function mapWork(work: OpenAlexWork): SourceSearchResult {
  const abstract = reconstructAbstract(work.abstract_inverted_index);
  const url = work.open_access?.oa_url || work.primary_location?.landing_page_url || work.doi || work.id;
  return {
    source: "openalex",
    externalId: work.id.replace("https://openalex.org/", ""),
    title: stripHtml(work.display_name) || "Untitled work",
    authors: work.authorships?.map((a) => a.author?.display_name).filter(Boolean) as string[] | undefined,
    abstract,
    url,
    publishedDate: work.publication_date || (work.publication_year ? String(work.publication_year) : undefined),
    license: work.open_access?.oa_status,
    isOpenAccess: !!work.open_access?.is_oa,
    contentType: work.type === "book" ? "book" : "article",
    tags: [work.type, ...(work.concepts ?? []).slice(0, 4).map((c) => c.display_name)].filter(Boolean) as string[],
    metadata: {
      doi: work.doi,
      openAlexId: work.id,
      host: work.primary_location?.source?.display_name,
      pdfUrl: work.primary_location?.pdf_url,
    },
  };
}

export const openAlexConnector: SourceConnector = {
  id: "openalex",
  label: "OpenAlex",
  fields: ["general", "medicine", "law", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const url = `${BASE}?search=${encodeURIComponent(input.query)}&per-page=${limit}&mailto=hello@syllibai.app`;
    const data = await fetchJson<OpenAlexResponse>(url);
    return data.results.map(mapWork);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const id = externalId.startsWith("W") ? `https://openalex.org/${externalId}` : externalId;
    const data = await fetchJson<OpenAlexWork>(`${BASE}/${encodeURIComponent(id)}?mailto=hello@syllibai.app`);
    const item = mapWork(data);
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
