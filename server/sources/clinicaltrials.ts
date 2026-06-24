import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, normalizeWhitespace } from "./types";

const BASE = "https://clinicaltrials.gov/api/v2/studies";

type Study = {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string; officialTitle?: string };
    statusModule?: { startDateStruct?: { date?: string }; overallStatus?: string };
    descriptionModule?: { briefSummary?: string; detailedDescription?: string };
    conditionsModule?: { conditions?: string[] };
    sponsorCollaboratorsModule?: { leadSponsor?: { name?: string } };
  };
};
type ClinicalTrialsResponse = { studies?: Study[] };

function mapStudy(study: Study): SourceSearchResult {
  const p = study.protocolSection;
  const id = p?.identificationModule?.nctId ?? "unknown";
  return {
    source: "clinicaltrials",
    externalId: id,
    title: p?.identificationModule?.briefTitle || p?.identificationModule?.officialTitle || "Untitled clinical trial",
    authors: [p?.sponsorCollaboratorsModule?.leadSponsor?.name].filter(Boolean) as string[],
    abstract: normalizeWhitespace(p?.descriptionModule?.briefSummary || p?.descriptionModule?.detailedDescription),
    url: `https://clinicaltrials.gov/study/${id}`,
    publishedDate: p?.statusModule?.startDateStruct?.date,
    license: "ClinicalTrials.gov public government data",
    isOpenAccess: true,
    contentType: "trial",
    tags: ["clinical trial", p?.statusModule?.overallStatus, ...(p?.conditionsModule?.conditions ?? []).slice(0, 4)].filter(Boolean) as string[],
    metadata: { nctId: id, status: p?.statusModule?.overallStatus, conditions: p?.conditionsModule?.conditions },
  };
}

export const clinicalTrialsConnector: SourceConnector = {
  id: "clinicaltrials",
  label: "ClinicalTrials.gov",
  fields: ["medicine", "all"],
  async search(input) {
    const limit = Math.min(input.limit ?? 10, 25);
    const data = await fetchJson<ClinicalTrialsResponse>(`${BASE}?query.term=${encodeURIComponent(input.query)}&pageSize=${limit}`);
    return (data.studies ?? []).map(mapStudy);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const data = await fetchJson<ClinicalTrialsResponse>(`${BASE}/${encodeURIComponent(externalId)}`);
    const study = Array.isArray((data as any).studies) ? (data as any).studies[0] : (data as any);
    const item = mapStudy(study);
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
