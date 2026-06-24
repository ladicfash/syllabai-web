import { arxivConnector } from "./arxiv";
import { clinicalTrialsConnector } from "./clinicaltrials";
import { courtListenerConnector } from "./courtlistener";
import { europePmcConnector } from "./europepmc";
import { openAlexConnector } from "./openalex";
import { pubMedConnector } from "./pubmed";
import { assertImportAllowed, sourceSafetyPolicy } from "./policy";
import type { AcademicSource, SourceConnector, SourceSearchInput, SourceSearchResult } from "./types";
import { academicSourceIds } from "./types";

export { academicSourceIds, sourceSafetyPolicy };
export type { AcademicSource, SourceSearchInput, SourceSearchResult } from "./types";
export { makePracticePrompt } from "./policy";

export const connectors: Record<AcademicSource, SourceConnector> = {
  openalex: openAlexConnector,
  pubmed: pubMedConnector,
  europepmc: europePmcConnector,
  arxiv: arxivConnector,
  clinicaltrials: clinicalTrialsConnector,
  courtlistener: courtListenerConnector,
};

function connectorsFor(input: SourceSearchInput) {
  if (input.source) return [connectors[input.source]];
  const field = input.field ?? "all";
  return Object.values(connectors).filter((connector) => connector.fields.includes(field) || connector.fields.includes("all"));
}

export async function searchSources(input: SourceSearchInput) {
  const selected = connectorsFor(input);
  const perSourceLimit = input.source ? input.limit ?? 10 : Math.min(input.limit ?? 10, 10);
  const settled = await Promise.allSettled(selected.map((connector) => connector.search({ ...input, limit: perSourceLimit })));

  const results: SourceSearchResult[] = [];
  const errors: { source: string; message: string }[] = [];

  settled.forEach((result, i) => {
    const source = selected[i].id;
    if (result.status === "fulfilled") results.push(...result.value);
    else errors.push({ source, message: result.reason?.message ?? "Unknown source error" });
  });

  return {
    results: results.slice(0, input.limit ?? 25),
    errors,
  };
}

export async function getSourceItem(source: AcademicSource, externalId: string) {
  const item = await connectors[source].getById(externalId);
  assertImportAllowed(source, item);
  return item;
}
