import type { AcademicSource, SourceSearchResult } from "./types";

export const sourceSafetyPolicy = {
  title: "Legal and academic source policy",
  summary:
    "syllabAI only imports user-uploaded content, public metadata/abstracts, and open-access/public-domain/government materials. It does not scrape, store, or reproduce proprietary question banks or paywalled course materials.",
  prohibited: [
    "Do not scrape or import UWorld, NBME, AMBOSS, commercial bar prep, paid casebooks, or other proprietary question-bank content.",
    "Do not bypass paywalls, logins, DRM, robots.txt/terms restrictions, or API limits.",
    "Do not represent AI-generated practice questions as official UWorld/NBME/bar-prep questions.",
  ],
  allowed: [
    "Search public APIs and public metadata.",
    "Import abstracts and open-access/public-domain/government full text when the source allows it.",
    "Generate original USMLE-style, bar-style, or exam-style practice questions from lawful source material.",
    "Store citations, license status, source URL, and provenance for every imported item.",
  ],
};

const proprietaryNames = [
  "uworld",
  "u world",
  "nbme",
  "amboss",
  "kaplan qbank",
  "commercial question bank",
  "barbri mbe",
  "themis mbe",
];

export function assertImportAllowed(source: AcademicSource, item: SourceSearchResult) {
  const haystack = `${source} ${item.title} ${item.url ?? ""} ${item.abstract ?? ""}`.toLowerCase();
  const blocked = proprietaryNames.find((name) => haystack.includes(name));
  if (blocked) {
    throw new Error(
      `This looks like proprietary content (${blocked}). syllabAI will not import or store copied commercial question-bank materials. Use public/open sources or upload only content you have the legal right to use.`
    );
  }
}

export function makePracticePrompt(kind: "medical" | "law" | "research", content: string) {
  const shared = `Use only the lawful source material below. Create original educational content. Do not quote or imitate proprietary question-bank wording. Include citations/source caveats where relevant.\n\nSOURCE MATERIAL:\n${content}`;

  if (kind === "medical") {
    return `Generate 5 original USMLE-style multiple-choice questions from this source. Do not claim they are from UWorld, NBME, AMBOSS, or any official source. Include answer explanations, why wrong options are wrong, and a high-yield takeaway.\n\n${shared}`;
  }
  if (kind === "law") {
    return `Generate 3 original bar-style or law-school issue-spotter practice questions from this source. Do not copy commercial bar-prep content. Include issue, rule, application, conclusion, and concise model answer.\n\n${shared}`;
  }
  return `Create an academic study aid from this source: concise summary, methods/results/limitations if applicable, 8 flashcard-style Q/A pairs, and 5 discussion questions.\n\n${shared}`;
}
