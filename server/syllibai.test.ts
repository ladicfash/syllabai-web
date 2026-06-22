import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test Student",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns the authenticated user", async () => {
    const ctx = createTestCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test Student");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx = createTestCtx();
    ctx.res.clearCookie = (name: string) => cleared.push(name);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared).toHaveLength(1);
  });
});

describe("router structure", () => {
  // tRPC v11: use flat _def.procedures keys (e.g. 'notes.list')
  function getProcedureKeys(router: any): string[] {
    return Object.keys(router._def.procedures ?? {});
  }

  it("has all expected top-level namespaces", () => {
    const keys = Object.keys((appRouter as any)._def.record);
    expect(keys).toContain("auth");
    expect(keys).toContain("documents");
    expect(keys).toContain("ai");
    expect(keys).toContain("decks");
    expect(keys).toContain("tasks");
    expect(keys).toContain("timer");
    expect(keys).toContain("notes");
    expect(keys).toContain("voice");
  });

  it("documents router has expected procedures", () => {
    const keys = getProcedureKeys(appRouter);
    expect(keys).toContain("documents.list");
    expect(keys).toContain("documents.upload");
    expect(keys).toContain("documents.delete");
  });

  it("ai router has all study tool procedures", () => {
    const keys = getProcedureKeys(appRouter);
    expect(keys).toContain("ai.generateFlashcards");
    expect(keys).toContain("ai.generateCornellNotes");
    expect(keys).toContain("ai.generateMindMap");
    expect(keys).toContain("ai.generateTimeline");
    expect(keys).toContain("ai.generateFlowchart");
    expect(keys).toContain("ai.generateKeyPoints");
    expect(keys).toContain("ai.detectDeadlines");
    expect(keys).toContain("ai.simulation");
  });

  it("decks router has spaced repetition procedures", () => {
    const keys = getProcedureKeys(appRouter);
    expect(keys).toContain("decks.list");
    expect(keys).toContain("decks.cards");
    expect(keys).toContain("decks.dueCards");
    expect(keys).toContain("decks.reviewCard");
    expect(keys).toContain("decks.saveQuizResult");
  });

  it("notes router has CRUD and share procedures", () => {
    const keys = getProcedureKeys(appRouter);
    expect(keys).toContain("notes.list");
    expect(keys).toContain("notes.create");
    expect(keys).toContain("notes.update");
    expect(keys).toContain("notes.delete");
    expect(keys).toContain("notes.share");
  });
});
