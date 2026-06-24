import type { ImportedSourceItem, SourceSearchResult } from "./types";

function listAuthors(authors?: string[]) {
  if (!authors?.length) return "Unknown author";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} et al.`;
}

function year(date?: string) {
  return date?.match(/\d{4}/)?.[0] ?? "n.d.";
}

function legalCitation(item: SourceSearchResult) {
  const court = typeof item.metadata?.court === "string" ? item.metadata.court : undefined;
  const date = item.publishedDate ? ` (${item.publishedDate})` : "";
  return `${item.title}${court ? `, ${court}` : ""}${date}. ${item.url ?? ""}`.trim();
}

export function buildCitations(item: SourceSearchResult): ImportedSourceItem["citation"] {
  const authors = listAuthors(item.authors);
  const y = year(item.publishedDate);
  const url = item.url ?? "";

  return {
    apa: `${authors}. (${y}). ${item.title}. ${item.source}. ${url}`.trim(),
    mla: `${authors}. "${item.title}." ${item.source}, ${y}, ${url}`.trim(),
    chicago: `${authors}. "${item.title}." ${item.source}. ${y}. ${url}`.trim(),
    legal: item.contentType === "case" ? legalCitation(item) : undefined,
  };
}

export function buildImportText(item: SourceSearchResult, citation = buildCitations(item)) {
  const authors = item.authors?.length ? item.authors.join(", ") : "Unknown";
  const tags = item.tags?.length ? item.tags.join(", ") : "";
  const metadata = item.metadata ? JSON.stringify(item.metadata, null, 2) : "{}";
  return `# ${item.title}

Source: ${item.source}
External ID: ${item.externalId}
Content type: ${item.contentType}
Authors: ${authors}
Published: ${item.publishedDate ?? "Unknown"}
Open access: ${item.isOpenAccess ? "Yes" : "No/unknown"}
License: ${item.license ?? "Unknown"}
URL: ${item.url ?? ""}
${tags ? `Tags: ${tags}\n` : ""}

## Abstract / Summary
${item.abstract || "No abstract was provided by this source. Use the source URL for the original record."}

## Citation
APA: ${citation.apa}
MLA: ${citation.mla}
Chicago: ${citation.chicago}${citation.legal ? `\nLegal: ${citation.legal}` : ""}

## Source metadata
\`\`\`json
${metadata}
\`\`\`
`;
}
