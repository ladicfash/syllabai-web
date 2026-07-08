import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// ── Mock DB ───────────────────────────────────────────────────────────────────

const mockInsertValues = vi.fn().mockResolvedValue({ insertId: 7 });
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues });

const mockLimitResolved = vi.fn().mockResolvedValue([]);
const mockOrderByLimit = vi.fn().mockReturnValue({ limit: mockLimitResolved });
const mockWhereOrderBy = vi.fn().mockReturnValue({ orderBy: mockOrderByLimit, limit: mockLimitResolved });
const mockFromWhere = vi.fn().mockReturnValue({ where: mockWhereOrderBy });
const mockSelect = vi.fn().mockReturnValue({ from: mockFromWhere });

const mockDb = {
  insert: mockInsert,
  select: mockSelect,
};

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, getDb: vi.fn().mockResolvedValue(mockDb) };
});

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

function makeAnonCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("studyRooms.create", () => {
  beforeEach(() => {
    mockInsertValues.mockResolvedValue({ insertId: 7 });
  });

  it("creates a room and returns a room code capped at 30 minutes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    const result = await caller.studyRooms.create({ topic: "Bio 201 midterm review" });

    expect(typeof result.roomCode).toBe("string");
    expect(result.roomCode.length).toBeGreaterThan(0);
    expect(result.durationMinutes).toBe(30);
  });

  it("rejects an empty topic", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    await expect(caller.studyRooms.create({ topic: "" })).rejects.toThrow();
  });

  it("requires authentication", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeAnonCtx());

    await expect(caller.studyRooms.create({ topic: "Anything" })).rejects.toThrow();
  });
});

describe("studyRooms.listMine", () => {
  it("returns an empty list when the user has no rooms", async () => {
    mockLimitResolved.mockResolvedValueOnce([]);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeCtx());

    const result = await caller.studyRooms.listMine();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("studyRooms.getByCode", () => {
  it("is accessible without authentication (public join link)", async () => {
    mockLimitResolved.mockResolvedValueOnce([]);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(makeAnonCtx());

    const result = await caller.studyRooms.getByCode({ roomCode: "does-not-exist" });
    expect(result).toBeNull();
  });
});
