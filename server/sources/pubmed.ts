import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, fetchText, normalizeWhitespace, stripHtml } from "./types";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

type ESearch = { esearchresult?: { idlist?: string[] } };
type ESummary = {
  result?: Record<string, any> & { uids?: string[] };
};

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

function allTags(xml: string, name: string) {
  return Array.from(xml.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "gi"))).map((m) => stripHtml(decodeXml(m[1]))).filter(Boolean);
}

function abstractFromXml(xml: string) {
  const parts = allTags(xml, "AbstractText");
  return normalizeWhitespace(parts.join(" ")) || undefined;
}

function mapSummary(uid: string, summary: any, abstract?: string): SourceSearchResult {
  const authors = Array.isArray(summary.authors)
    ? summary.authors.map((a: any) => a.name).filter(Boolean)
    : undefined;
  return {
    source: "pubmed",
    externalId: uid,
    title: stripHtml(summary.title) || "Untitled PubMed record",
    authors,
    abstract,
    url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
    publishedDate: summary.pubdate,
    license: "NCBI/PubMed metadata; full text only when open access from linked sources",
    isOpenAccess: undefined,
    contentType: "article",
    tags: [summary.source, "PubMed", "biomedical"].filter(Boolean),
    metadata: {
      uid,
      source: summary.source,
      doi: summary.elocationid,
      pubtype: summary.pubtype,
    },
  };
}

async function fetchAbstract(uid: string) {
  try {
    const xml = await fetchText(`${EUTILS}/efetch.fcgi?db=pubmed&id=${encodeURIComponent(uid)}&retmode=xml`);
    return abstractFromXml(xml);
  } catch {
    return undefined;
  }
}

export const pubMedConnector: SourceConnector = {
  id: "pubmed",
  label: "PubMed",
  fields: ["medicine", "general", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const search = await fetchJson<ESearch>(`${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&term=${encodeURIComponent(input.query)}&retmax=${limit}`);
    const ids = search.esearchresult?.idlist ?? [];
    if (!ids.length) return [];
    const summary = await fetchJson<ESummary>(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`);
    const abstracts = await Promise.all(ids.slice(0, Math.min(ids.length, 8)).map(fetchAbstract));
    return ids.map((uid, i) => mapSummary(uid, summary.result?.[uid] ?? {}, abstracts[i]));
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const summary = await fetchJson<ESummary>(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${encodeURIComponent(externalId)}`);
    const abstract = await fetchAbstract(externalId);
    const item = mapSummary(externalId, summary.result?.[externalId] ?? {}, abstract);
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
