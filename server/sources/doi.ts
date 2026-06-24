import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceSearchResult } from "./types";
import { fetchJson, normalizeWhitespace, stripHtml } from "./types";

const DOI_REGEX = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i;

type UnpaywallLocation = {
  url?: string;
  url_for_pdf?: string;
  url_for_landing_page?: string;
  license?: string;
  host_type?: string;
  version?: string;
};

type UnpaywallResponse = {
  doi: string;
  title?: string;
  year?: number;
  journal_name?: string;
  is_oa?: boolean;
  oa_status?: string;
  genre?: string;
  z_authors?: { given?: string; family?: string; name?: string }[];
  best_oa_location?: UnpaywallLocation;
  oa_locations?: UnpaywallLocation[];
};

export function extractDoi(...values: Array<unknown>) {
  const text = values.filter(Boolean).join(" ");
  return text.match(DOI_REGEX)?.[0]?.replace(/[).,;]+$/, "");
}

function unpaywallEmail() {
  return process.env.UNPAYWALL_EMAIL || process.env.SOURCE_HUB_CONTACT_EMAIL || "hello@syllibai.app";
}

function authorName(author: { given?: string; family?: string; name?: string }) {
  if (author.name) return author.name;
  return [author.given, author.family].filter(Boolean).join(" ").trim();
}

export async function lookupOpenAccessByDoi(doi?: string): Promise<Partial<SourceSearchResult>> {
  if (!doi) return {};
  try {
    const data = await fetchJson<UnpaywallResponse>(`https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${encodeURIComponent(unpaywallEmail())}`);
    const location = data.best_oa_location ?? data.oa_locations?.find((loc) => loc.url_for_pdf || loc.url);
    const fullTextUrl = location?.url_for_pdf || location?.url || location?.url_for_landing_page;
    return {
      fullTextUrl,
      isOpenAccess: !!data.is_oa,
      license: location?.license || data.oa_status,
      tags: [data.oa_status, location?.host_type, location?.version].filter(Boolean) as string[],
      metadata: {
        doi: data.doi,
        unpaywall: {
          isOpenAccess: data.is_oa,
          oaStatus: data.oa_status,
          bestLocation: location,
        },
      },
    };
  } catch {
    return {};
  }
}

export async function fetchDoiOpenAccessItem(doi: string): Promise<ImportedSourceItem> {
  const data = await fetchJson<UnpaywallResponse>(`https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${encodeURIComponent(unpaywallEmail())}`);
  const location = data.best_oa_location ?? data.oa_locations?.find((loc) => loc.url_for_pdf || loc.url);
  if (!data.is_oa || !location) throw new Error("No open-access full-text location found for this DOI.");

  const item: SourceSearchResult = {
    source: "openalex",
    externalId: doi,
    title: stripHtml(data.title) || `DOI ${doi}`,
    authors: data.z_authors?.map(authorName).filter(Boolean),
    abstract: `Open-access record resolved by DOI through Unpaywall. ${data.journal_name ? `Journal: ${data.journal_name}.` : ""}`,
    url: `https://doi.org/${doi}`,
    fullTextUrl: location.url_for_pdf || location.url || location.url_for_landing_page,
    publishedDate: data.year ? String(data.year) : undefined,
    license: location.license || data.oa_status,
    isOpenAccess: true,
    contentType: data.genre === "book" ? "book" : "article",
    tags: ["DOI", "open access", data.oa_status, location.host_type].filter(Boolean) as string[],
    metadata: { doi, unpaywall: { oaStatus: data.oa_status, location } },
  };
  const citation = buildCitations(item);
  const fullTextNote = normalizeWhitespace(
    `Open-access full text is available at: ${item.fullTextUrl}. syllabAI stores the citation, metadata, and source URL. Download/extraction can be added for allowed PDFs, but this import avoids copying paywalled or unclear-license full text.`
  );
  return {
    ...item,
    fullText: fullTextNote,
    citation,
    importedText: `${buildImportText(item, citation)}\n\n## Open-access full-text location\n${fullTextNote}\n`,
  };
}
