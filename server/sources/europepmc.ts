import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, stripHtml } from "./types";

const BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

type EuropePmcResult = {
  id: string;
  source?: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title?: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: string;
  firstPublicationDate?: string;
  abstractText?: string;
  isOpenAccess?: "Y" | "N";
  inEPMC?: "Y" | "N";
  hasPDF?: "Y" | "N";
  license?: string;
};
type EuropePmcResponse = { resultList?: { result?: EuropePmcResult[] } };

function mapResult(r: EuropePmcResult): SourceSearchResult {
  const externalId = r.pmcid || r.pmid || r.id;
  return {
    source: "europepmc",
    externalId,
    title: stripHtml(r.title) || "Untitled Europe PMC record",
    authors: r.authorString?.split(/,\s*/).filter(Boolean),
    abstract: stripHtml(r.abstractText),
    url: r.pmcid ? `https://europepmc.org/article/PMC/${r.pmcid.replace(/^PMC/i, "")}` : `https://europepmc.org/article/${r.source ?? "MED"}/${r.id}`,
    publishedDate: r.firstPublicationDate || r.pubYear,
    license: r.license,
    isOpenAccess: r.isOpenAccess === "Y",
    contentType: "article",
    tags: ["Europe PMC", r.journalTitle, r.hasPDF === "Y" ? "PDF available" : undefined].filter(Boolean) as string[],
    metadata: { pmid: r.pmid, pmcid: r.pmcid, doi: r.doi, source: r.source, journal: r.journalTitle, hasPDF: r.hasPDF },
  };
}

async function searchByQuery(query: string, limit: number) {
  const url = `${BASE}?query=${encodeURIComponent(query)}&format=json&pageSize=${limit}&resultType=core`;
  return fetchJson<EuropePmcResponse>(url);
}

export const europePmcConnector: SourceConnector = {
  id: "europepmc",
  label: "Europe PMC",
  fields: ["medicine", "general", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const data = await searchByQuery(input.query, limit);
    return (data.resultList?.result ?? []).map(mapResult);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const data = await searchByQuery(`EXT_ID:${externalId}`, 1);
    const raw = data.resultList?.result?.[0] ?? (await searchByQuery(externalId, 1)).resultList?.result?.[0];
    if (!raw) throw new Error("Europe PMC item not found");
    const item = mapResult(raw);
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
