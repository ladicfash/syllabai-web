export const academicSourceIds = [
  "openalex",
  "pubmed",
  "europepmc",
  "arxiv",
  "clinicaltrials",
  "courtlistener",
  "semanticscholar",
  "govinfo",
  "congress",
  "crossref",
  "datacite",
  "openlibrary",
] as const;

export const internalSourceIds = ["unpaywall"] as const;

export type PublicAcademicSource = (typeof academicSourceIds)[number];
export type InternalAcademicSource = (typeof internalSourceIds)[number];
export type AcademicSource = PublicAcademicSource | InternalAcademicSource;

export type SourceField = "medicine" | "law" | "general" | "all";

export type ContentType = "article" | "case" | "trial" | "book" | "dataset" | "preprint" | "other";

export type SourceSearchInput = {
  query: string;
  source?: PublicAcademicSource;
  field?: SourceField;
  limit?: number;
};

export type LicenseConfidence = "high" | "medium" | "low" | "unknown";

export type SourceSearchResult = {
  source: PublicAcademicSource;
  externalId: string;
  title: string;
  authors?: string[];
  abstract?: string;
  fullText?: string;
  url?: string;
  fullTextUrl?: string;
  publishedDate?: string;
  license?: string;
  licenseConfidence?: LicenseConfidence;
  isOpenAccess?: boolean;
  contentType: ContentType;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export type ImportedSourceItem = SourceSearchResult & {
  importedText: string;
  citation: {
    apa: string;
    mla: string;
    chicago: string;
    legal?: string;
  };
};

export type SourceConnector = {
  id: PublicAcademicSource;
  label: string;
  fields: SourceField[];
  requiresApiKey?: boolean;
  search(input: SourceSearchInput): Promise<SourceSearchResult[]>;
  getById(externalId: string): Promise<ImportedSourceItem>;
};

export function normalizeWhitespace(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function stripHtml(value?: string | null) {
  return normalizeWhitespace((value ?? "").replace(/<[^>]+>/g, " "));
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": "syllabAI/1.0 academic-source-hub (mailto:hello@syllibai.app)",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Source request failed (${res.status}) for ${url}`);
  return res.json() as Promise<T>;
}

export async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": "syllabAI/1.0 academic-source-hub (mailto:hello@syllibai.app)",
      Accept: "application/xml,text/xml,text/plain,*/*",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Source request failed (${res.status}) for ${url}`);
  return res.text();
}
