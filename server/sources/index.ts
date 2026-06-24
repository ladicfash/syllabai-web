import { arxivConnector } from "./arxiv";
import { cachedSourceCall, getSourceCacheStats } from "./cache";
import { clinicalTrialsConnector } from "./clinicaltrials";
import { congressConnector } from "./congress";
import { courtListenerConnector } from "./courtlistener";
import { fetchDoiOpenAccessItem } from "./doi";
import { europePmcConnector } from "./europepmc";
import { govInfoConnector } from "./govinfo";
import { openAlexConnector } from "./openalex";
import { pubMedConnector } from "./pubmed";
import { semanticScholarConnector } from "./semanticscholar";
import { assertImportAllowed, sourceSafetyPolicy, withLicenseConfidence } from "./policy";
import type { PublicAcademicSource, SourceConnector, SourceSearchInput, SourceSearchResult } from "./types";
import { academicSourceIds } from "./types";

export { academicSourceIds, sourceSafetyPolicy, getSourceCacheStats };
export type { AcademicSource, PublicAcademicSource, SourceSearchInput, SourceSearchResult } from "./types";
export { makePracticePrompt } from "./policy";
export { extractDoi, fetchDoiOpenAccessItem, lookupOpenAccessByDoi } from "./doi";

export const connectors: Record<PublicAcademicSource, SourceConnector> = {
  openalex: openAlexConnector,
  pubmed: pubMedConnector,
  europepmc: europePmcConnector,
  arxiv: arxivConnector,
  clinicaltrials: clinicalTrialsConnector,
  courtlistener: courtListenerConnector,
  semanticscholar: semanticScholarConnector,
  govinfo: govInfoConnector,
  congress: congressConnector,
};

function connectorsFor(input: SourceSearchInput) {
  if (input.source) return [connectors[input.source]];
  const field = input.field ?? "all";
  return Object.values(connectors).filter((connector) => connector.fields.includes(field) || connector.fields.includes("all"));
}

export function listSourceCapabilities() {
  return Object.values(connectors).map((connector) => ({
    id: connector.id,
    label: connector.label,
    fields: connector.fields,
    requiresApiKey: !!connector.requiresApiKey,
    configured:
      connector.id === "semanticscholar" ? true :
      connector.id === "govinfo" ? !!process.env.GOVINFO_API_KEY :
      connector.id === "congress" ? !!process.env.CONGRESS_GOV_API_KEY :
      true,
  }));
}

export async function searchSources(input: SourceSearchInput) {
  const selected = connectorsFor(input);
  const perSourceLimit = input.source ? input.limit ?? 10 : Math.min(input.limit ?? 10, 10);
  const settled = await Promise.allSettled(
    selected.map((connector) =>
      cachedSourceCall(connector.id, "search", { ...input, source: connector.id, limit: perSourceLimit }, () =>
        connector.search({ ...input, source: connector.id, limit: perSourceLimit })
      )
    )
  );

  const results: SourceSearchResult[] = [];
  const errors: { source: string; message: string }[] = [];

  settled.forEach((result, i) => {
    const source = selected[i].id;
    if (result.status === "fulfilled") results.push(...result.value.map(withLicenseConfidence));
    else errors.push({ source, message: result.reason?.message ?? "Unknown source error" });
  });

  return {
    results: results.slice(0, input.limit ?? 25),
    errors,
    cache: getSourceCacheStats(),
  };
}

export async function getSourceItem(source: PublicAcademicSource, externalId: string) {
  const item = await cachedSourceCall(source, "get", { externalId }, () => connectors[source].getById(externalId));
  const withConfidence = { ...item, licenseConfidence: item.licenseConfidence ?? withLicenseConfidence(item).licenseConfidence };
  assertImportAllowed(source, withConfidence);
  return withConfidence;
}

export async function getDoiOpenAccessItem(doi: string) {
  const item = await cachedSourceCall("unpaywall", "doi", { doi }, () => fetchDoiOpenAccessItem(doi));
  return { ...item, licenseConfidence: item.licenseConfidence ?? withLicenseConfidence(item).licenseConfidence };
}
