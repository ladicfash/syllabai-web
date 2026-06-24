import { buildCitations, buildImportText } from "./citations";
import type { ImportedSourceItem, SourceConnector, SourceSearchResult } from "./types";
import { fetchJson, stripHtml } from "./types";

const BASE = "https://api.congress.gov/v3";

type CongressBill = {
  congress?: number;
  number?: string;
  type?: string;
  title?: string;
  updateDate?: string;
  latestAction?: { text?: string; actionDate?: string };
  url?: string;
};
type CongressBillResponse = { bills?: CongressBill[]; bill?: CongressBill };

function apiKey() {
  return process.env.CONGRESS_GOV_API_KEY;
}

function requireKey() {
  const key = apiKey();
  if (!key) throw new Error("Congress.gov integration requires a free CONGRESS_GOV_API_KEY environment variable.");
  return key;
}

function billId(bill: CongressBill) {
  return [bill.congress, bill.type, bill.number].filter(Boolean).join("-");
}

function mapBill(bill: CongressBill): SourceSearchResult {
  const id = billId(bill);
  const type = bill.type?.toLowerCase();
  const url = bill.url || (bill.congress && type && bill.number ? `https://www.congress.gov/bill/${bill.congress}th-congress/${type}-bill/${bill.number}` : undefined);
  return {
    source: "congress",
    externalId: id,
    title: stripHtml(bill.title) || `Congress.gov bill ${id}`,
    authors: ["U.S. Congress"],
    abstract: stripHtml(bill.latestAction?.text),
    url,
    publishedDate: bill.latestAction?.actionDate || bill.updateDate,
    license: "U.S. government public information",
    isOpenAccess: true,
    contentType: "dataset",
    tags: ["government", "Congress.gov", bill.type, bill.congress ? `${bill.congress}th Congress` : undefined].filter(Boolean) as string[],
    metadata: { congress: bill.congress, type: bill.type, number: bill.number, latestAction: bill.latestAction, apiUrl: bill.url },
  };
}

function parseExternalId(externalId: string) {
  const [congress, type, number] = externalId.split("-");
  if (!congress || !type || !number) throw new Error("Congress item ID should be formatted as congress-type-number, e.g. 118-hr-1234.");
  return { congress, type: type.toLowerCase(), number };
}

export const congressConnector: SourceConnector = {
  id: "congress",
  label: "Congress.gov",
  fields: ["law", "general", "all"],
  requiresApiKey: true,
  async search(input) {
    const key = requireKey();
    const limit = Math.min(input.limit ?? 10, 25);
    const data = await fetchJson<CongressBillResponse>(`${BASE}/bill?format=json&limit=50&api_key=${encodeURIComponent(key)}`);
    const query = input.query.toLowerCase();
    return (data.bills ?? [])
      .filter((bill) => `${bill.title ?? ""} ${bill.latestAction?.text ?? ""} ${bill.type ?? ""} ${bill.number ?? ""}`.toLowerCase().includes(query))
      .slice(0, limit)
      .map(mapBill);
  },
  async getById(externalId): Promise<ImportedSourceItem> {
    const key = requireKey();
    const { congress, type, number } = parseExternalId(externalId);
    const data = await fetchJson<CongressBillResponse>(`${BASE}/bill/${encodeURIComponent(congress)}/${encodeURIComponent(type)}/${encodeURIComponent(number)}?format=json&api_key=${encodeURIComponent(key)}`);
    const item = mapBill(data.bill ?? { congress: Number(congress), type, number, title: `Congress.gov bill ${externalId}` });
    const citation = buildCitations(item);
    return { ...item, citation, importedText: buildImportText(item, citation) };
  },
};
