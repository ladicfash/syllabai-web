import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// ── Mock DB ───────────────────────────────────────────────────────────────────
// The courseGraph router calls getDb() from './db' (relative to server/).
// We mock that module so no real DB connection is needed.

const mockInsertValues = vi.fn().mockResolvedValue({ insertId: 42 });
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues });

const mockWhereResolved = vi.fn().mockResolvedValue([]);
const mockFromWhere = vi.fn().mockReturnValue({ where: mockWhereResolved });
const mockSelect = vi.fn().mockReturnValue({ from: mockFromWhere });

const mockUpdateSetWhere = vi.fn().mockResolvedValue({});
const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateSetWhere });
const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet });

const mockDeleteWhere = vi.fn().mockResolvedValue({});
const mockDelete = vi.fn().mockReturnValue({ where: mockDeleteWhere });

const mockDb = {
  insert: mockInsert,
  select: mockSelect,
  update: mockUpdate,
  delete: mockDelete,
};

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, getDb: vi.fn().mockResolvedValue(mockDb) };
});

// ── Mock invokeLLM ────────────────────────────────────────────────────────────
// The courseGraph router imports from '../_core/llm' (relative to server/routers/).
// Vitest resolves vi.mock paths relative to the test file, so we use the path
// relative to this test file (server/).

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            courseName: "Introduction to Machine Learning",
            topics: [
              { name: "Supervised Learning", description: "Learning with labels.", isRoot: true },
              { name: "Linear Regression", description: "Predict continuous values.", isRoot: false, parentName: "Supervised Learning" },
              { name: "Neural Networks", description: "Deep learning fundamentals.", isRoot: true },
            ],
          }),
        },
      },
    ],
  }),
}));

// ── Mock pdf-parse ────────────────────────────────────────────────────────────

vi.mock("pdf-parse", () => ({
  PDFParse: vi.fn().mockImplementation(() => ({
    getText: vi.fn().mockResolvedValue({ text: "Sample syllabus content for testing." }),
    destroy: vi.fn().mockResolvedValue(undefined),
  })),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCtx(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("courseGraph.createCourse", () => {
  beforeEach(() => {
    mockInsertValues.mockResolvedValue({ insertId: 42 });
  });

  it("creates a course and returns courseId", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    const result = await caller.courseGraph.createCourse({
      name: "Introduction to Machine Learning",
    });

    expect(result.success).toBe(true);
    expect(typeof result.courseId).toBe("number");
  });

  it("rejects empty course name", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    await expect(
      caller.courseGraph.createCourse({ name: "" })
    ).rejects.toThrow();
  });
});

describe("courseGraph.bulkCreateTopics", () => {
  beforeEach(() => {
    mockInsertValues.mockResolvedValue({ insertId: 10 });
  });

  it("bulk-creates root topics and child topics", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    const result = await caller.courseGraph.bulkCreateTopics({
      courseId: 1,
      topics: [
        { name: "Supervised Learning", description: "Root topic" },
        { name: "Linear Regression", description: "Child topic", parentName: "Supervised Learning" },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
  });

  it("handles empty topics array gracefully", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    const result = await caller.courseGraph.bulkCreateTopics({
      courseId: 1,
      topics: [],
    });

    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
  });
});

describe("courseGraph.getCourses", () => {
  it("returns empty array when no courses exist", async () => {
    mockWhereResolved.mockResolvedValue([]);

    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    const result = await caller.courseGraph.getCourses();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("returns courses when they exist", async () => {
    mockWhereResolved.mockResolvedValueOnce([
      { id: 1, userId: 1, name: "ML Course", createdAt: new Date() },
    ]);

    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    const result = await caller.courseGraph.getCourses();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("courseGraph.getTopics", () => {
  it("returns empty array when no topics exist", async () => {
    mockWhereResolved.mockResolvedValue([]);

    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    const result = await caller.courseGraph.getTopics({ courseId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("courseGraph.extractTopics", () => {
  it("throws when text is too short", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    await expect(
      caller.courseGraph.extractTopics({ text: "too short" })
    ).rejects.toThrow("Not enough text");
  });

  it("throws when no input provided", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    await expect(
      caller.courseGraph.extractTopics({})
    ).rejects.toThrow();
  });
});
