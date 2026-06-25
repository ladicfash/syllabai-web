import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, stripHtml } from "./types";

const BASE = "https://api.datacite.org/dois";

type DataCiteItem = {
  id: string;
  attributes?: {
    doi?: string;
    titles?: { title?: string }[];
    creators?: { name?: string; givenName?: string; familyName?: string }[];
    descriptions?: { description?: string; descriptionType?: string }[];
    publicationYear?: number;
    publisher?: string;
    url?: string;
    types?: { resourceTypeGeneral?: string; resourceType?: string };
    rightsList?: { rights?: string; rightsUri?: string }[];
    subjects?: { subject?: string }[];
  };
};
type DataCiteList = { data?: DataCiteItem[] };
type DataCiteSingle = { data?: DataCiteItem };

function creatorName(c: { name?: string; givenName?: string; familyName?: string }) {
  return c.name || [c.givenName, c.familyName].filter(Boolean).join(" ").trim();
}

function mapItem(item: DataCiteItem): SourceSearchResult {
  const a = item.attributes ?? {};
  const doi = a.doi || item.id;
  const type = a.types?.resourceTypeGeneral?.toLowerCase();
  return {
    source: "datacite",
    externalId: doi,
    title: stripHtml(a.titles?.[0]?.title) || `DataCite DOI ${doi}`,
    authors: a.creators?.map(creatorName).filter(Boolean),
    abstract: stripHtml(a.descriptions?.find((d) => d.descriptionType?.toLowerCase() === "abstract")?.description || a.descriptions?.[0]?.description),
    url: a.url || `https://doi.org/${doi}`,
    publishedDate: a.publicationYear ? String(a.publicationYear) : undefined,
    license: a.rightsList?.[0]?.rightsUri || a.rightsList?.[0]?.rights,
    isOpenAccess: !!a.url,
    contentType: type === "dataset" ? "dataset" : type === "book" ? "book" : "other",
    tags: ["DataCite", a.types?.resourceTypeGeneral, a.publisher, ...(a.subjects ?? []).slice(0, 4).map((s) => s.subject)].filter(Boolean) as string[],
    metadata: { doi, publisher: a.publisher, resourceType: a.types, rights: a.rightsList },
  };
}

export const dataCiteConnector: SourceConnector = {
  id: "datacite",
  label: "DataCite",
  fields: ["general", "medicine", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const data = await fetchJson<DataCiteList>(`${BASE}?query=${encodeURIComponent(input.query)}&page[size]=${limit}`);
    return (data.data ?? []).map(mapItem);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const data = await fetchJson<DataCiteSingle>(`${BASE}/${encodeURIComponent(externalId)}`);
    if (!data.data) throw new Error("DataCite item not found");
    const item = mapItem(data.data);
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
