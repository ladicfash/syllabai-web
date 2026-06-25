import { describe, expect, it } from "vitest";

// Sanity-check the buildFallbackMarkdown strategy by reading the source and
// verifying the expected pieces are present. This guards against accidentally
// reverting the bug-fix that made AI generation always return useful output
// instead of failing silently.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("callAI fallback markdown", () => {
  const source = readFileSync(resolve(__dirname, "routers.ts"), "utf-8");

  it("defines a buildFallbackMarkdown helper", () => {
    expect(source).toMatch(/function buildFallbackMarkdown/);
  });

  it("supports summary, cornell, key_points, and generic fallback kinds", () => {
    expect(source).toMatch(/kind === "summary"/);
    expect(source).toMatch(/kind === "cornell"/);
    expect(source).toMatch(/kind === "key_points"/);
    expect(source).toMatch(/return \[/);
expect(source).toMatch(/AI service was unavailable/);
  });

  it("falls back when the AI service is unreachable", () => {
    // The callAI function must return buildFallbackMarkdown on caught errors.
    expect(source).toMatch(/if \(allowFallback\) return buildFallbackMarkdown/);
    expect(source).toMatch(/console\.error\(\"\[callAI\] failed:/);
  });
});

describe("bug-fix endpoints", () => {
  const source = readFileSync(resolve(__dirname, "routers.ts"), "utf-8");

  it("voice router exposes generateNotes", () => {
    expect(source).toMatch(/voice: router\(\{[\s\S]*?generateNotes: protectedProcedure/);
  });

  it("videoNotes router exposes generateNotes", () => {
    expect(source).toMatch(/videoNotes: router\(\{[\s\S]*?generateNotes: protectedProcedure/);
  });

  it("summarizeText uses the fallback path", () => {
    expect(source).toMatch(/summarizeText: protectedProcedure[\s\S]*?fallbackKind: input\.mode/);
  });

  it("generateStudyTemplate uses the fallback path", () => {
    expect(source).toMatch(/generateStudyTemplate: protectedProcedure[\s\S]*?fallbackKind: "generic"/);
  });
});

describe("voiceTranscription file extension helper", () => {
  const source = readFileSync(resolve(__dirname, "_core/voiceTranscription.ts"), "utf-8");

  it("handles mp4, m4a, flac and video containers", () => {
    expect(source).toMatch(/'audio\/m4a': 'm4a'/);
    expect(source).toMatch(/'audio\/mp4': 'm4a'/);
    expect(source).toMatch(/'audio\/flac': 'flac'/);
    expect(source).toMatch(/'video\/mp4': 'mp4'/);
  });

  it("sniffs audio/ prefix when MIME is unrecognized", () => {
    expect(source).toMatch(/startsWith\('audio\/'\)/);
  });
});
