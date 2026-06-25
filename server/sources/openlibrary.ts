import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, normalizeWhitespace, stripHtml } from "./types";

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  edition_count?: number;
  subject?: string[];
  ia?: string[];
  ebook_access?: string;
};
type OpenLibrarySearch = { docs?: OpenLibraryDoc[] };
type OpenLibraryWork = { key?: string; title?: string; description?: string | { value?: string }; subjects?: string[]; first_publish_date?: string };

function mapDoc(doc: OpenLibraryDoc): SourceSearchResult {
  const key = doc.key ?? "";
  const ia = doc.ia?.[0];
  return {
    source: "openlibrary",
    externalId: key.replace(/^\/works\//, ""),
    title: stripHtml(doc.title) || "Untitled Open Library work",
    authors: doc.author_name,
    abstract: doc.edition_count ? `${doc.edition_count} edition(s) indexed in Open Library.` : undefined,
    url: key ? `https://openlibrary.org${key}` : undefined,
    fullTextUrl: ia ? `https://archive.org/details/${ia}` : undefined,
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
    license: "Open Library metadata; book access/license varies by edition",
    isOpenAccess: doc.ebook_access === "public" || !!ia,
    contentType: "book",
    tags: ["Open Library", doc.ebook_access, ...(doc.subject ?? []).slice(0, 4)].filter(Boolean) as string[],
    metadata: { key, editionCount: doc.edition_count, internetArchiveId: ia, ebookAccess: doc.ebook_access },
  };
}

export const openLibraryConnector: SourceConnector = {
  id: "openlibrary",
  label: "Open Library",
  fields: ["general", "law", "medicine", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const data = await fetchJson<OpenLibrarySearch>(`https://openlibrary.org/search.json?q=${encodeURIComponent(input.query)}&limit=${limit}`);
    return (data.docs ?? []).map(mapDoc);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const key = externalId.startsWith("/works/") ? externalId : `/works/${externalId}`;
    const work = await fetchJson<OpenLibraryWork>(`https://openlibrary.org${key}.json`);
    const description = typeof work.description === "string" ? work.description : work.description?.value;
    const item: SourceSearchResult = {
      source: "openlibrary",
      externalId: key.replace(/^\/works\//, ""),
      title: stripHtml(work.title) || "Untitled Open Library work",
      abstract: normalizeWhitespace(stripHtml(description)),
      url: `https://openlibrary.org${key}`,
      publishedDate: work.first_publish_date,
      license: "Open Library metadata; book access/license varies by edition",
      isOpenAccess: true,
      contentType: "book",
      tags: ["Open Library", ...(work.subjects ?? []).slice(0, 5)].filter(Boolean) as string[],
      metadata: { key, subjects: work.subjects },
    };
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
