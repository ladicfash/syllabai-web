import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users, documents, sourceItems, studyOutputs, studyActivity, flashcardDecks, flashcards, notes, tasks, taskSubtasks,
  timerSessions, aiOutputs, quizSessions, quizMeReports, shareTokens, userSettings,
  voiceNotes, videoNotes, noteFolders,
  type InsertUser, type Document, type InsertDocument, type InsertSourceItem, type InsertStudyOutput, type InsertQuizMeReport,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ──────────────────────────────────────────────────────────────────
import { ENV } from "./_core/env";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ── Documents ──────────────────────────────────────────────────────────────
export async function createDocument(doc: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(documents).values(doc);
  return result[0];
}

export async function getDocumentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(documents).where(and(eq(documents.id, id), eq(documents.userId, userId))).limit(1);
  return result[0];
}

export async function deleteDocument(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
}

export async function updateDocumentText(id: number, extractedText: string, wordCount: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(documents).set({ extractedText, wordCount }).where(eq(documents.id, id));
}

// ── Imported Academic / Legal Sources ──────────────────────────────────────
export async function createSourceItem(item: InsertSourceItem) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(sourceItems).values(item);
  return result[0];
}

export async function getSourceItemsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(sourceItems).where(eq(sourceItems.userId, userId)).orderBy(desc(sourceItems.createdAt));
  } catch (err) {
    console.warn('[DB] source_items table not ready:', err);
    return [];
  }
}

// ── Study Studio Outputs + Activity ────────────────────────────────────────
export async function createStudyOutput(output: InsertStudyOutput) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(studyOutputs).values(output);
    return result[0];
  } catch (err) {
    console.warn('[DB] study_outputs table not ready, skipping save:', err);
    return null;
  }
}

export async function getStudyOutputsByUser(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(studyOutputs).where(eq(studyOutputs.userId, userId)).orderBy(desc(studyOutputs.createdAt)).limit(limit);
  } catch (err) {
    console.warn('[DB] study_outputs table not ready:', err);
    return [];
  }
}

export async function getStudyOutputById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studyOutputs).where(and(eq(studyOutputs.id, id), eq(studyOutputs.userId, userId))).limit(1);
  return result[0];
}

export async function recordStudyActivity(userId: number, activityType: string, count = 1, date = new Date()) {
  const db = await getDb();
  if (!db) return;
  const activityDate = date.toISOString().slice(0, 10);
  try {
    await db.insert(studyActivity).values({ userId, activityType, count, activityDate });
  } catch (err) {
    console.warn('[DB] study_activity table not ready, skipping record:', err);
  }
}

export async function getStudyActivityByUser(userId: number, days = 60) {
  const db = await getDb();
  if (!db) return [];
  try {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startKey = start.toISOString().slice(0, 10);
    return await db.select().from(studyActivity).where(and(eq(studyActivity.userId, userId), gte(studyActivity.activityDate, startKey))).orderBy(desc(studyActivity.activityDate));
  } catch (err) {
    console.warn('[DB] study_activity table not ready:', err);
    return [];
  }
}

// ── Flashcard Decks ────────────────────────────────────────────────────────
export async function createDeck(userId: number, title: string, documentId?: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(flashcardDecks).values({ userId, title, documentId });
  return result[0];
}

export async function getDecksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(flashcardDecks).where(eq(flashcardDecks.userId, userId)).orderBy(desc(flashcardDecks.createdAt));
}

export async function getDeckById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(flashcardDecks).where(and(eq(flashcardDecks.id, id), eq(flashcardDecks.userId, userId))).limit(1);
  return result[0];
}

// ── Flashcards ─────────────────────────────────────────────────────────────
export async function createFlashcards(cards: { deckId: number; userId: number; question: string; answer: string }[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (cards.length === 0) return;
  await db.insert(flashcards).values(cards);
}

export async function getFlashcardsByDeck(deckId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(flashcards).where(and(eq(flashcards.deckId, deckId), eq(flashcards.userId, userId)));
}

export async function getFlashcardById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(flashcards).where(and(eq(flashcards.id, id), eq(flashcards.userId, userId))).limit(1);
  return result[0];
}

export async function updateFlashcardContent(id: number, userId: number, question: string, answer: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(flashcards).set({ question, answer }).where(and(eq(flashcards.id, id), eq(flashcards.userId, userId)));
}

export async function updateFlashcardSRS(id: number, interval: number, repetitions: number, easeFactor: number, dueDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(flashcards).set({ interval, repetitions, easeFactor, dueDate }).where(eq(flashcards.id, id));
}

export async function getDueFlashcards(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(flashcards).where(and(eq(flashcards.userId, userId), lte(flashcards.dueDate, now)));
}

// ── Quiz Sessions ──────────────────────────────────────────────────────────
export async function saveQuizSession(data: {
  userId: number; deckId: number; documentId?: number;
  totalCards: number; knownCount: number; needsWorkCount: number; scorePercent: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(quizSessions).values(data);
}

export async function getQuizHistory(userId: number, deckId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = deckId
    ? and(eq(quizSessions.userId, userId), eq(quizSessions.deckId, deckId))
    : eq(quizSessions.userId, userId);
  return db.select().from(quizSessions).where(conditions).orderBy(desc(quizSessions.createdAt)).limit(20);
}

export async function saveQuizMeReport(data: InsertQuizMeReport) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(quizMeReports).values(data);
    return result[0];
  } catch (err) {
    console.warn('[DB] quiz_me_reports table not ready, skipping save:', err);
    return null;
  }
}

export async function getQuizMeReportsByUser(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(quizMeReports).where(eq(quizMeReports.userId, userId)).orderBy(desc(quizMeReports.createdAt)).limit(limit);
  } catch (err) {
    console.warn('[DB] quiz_me_reports table not ready:', err);
    return [];
  }
}

// ── Notes ──────────────────────────────────────────────────────────────────
export async function createNote(data: { userId: number; documentId?: number; title: string; content: string; color?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(notes).values({ ...data, color: data.color ?? "#fef3c7" });
  return result[0];
}

export async function getNotesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.isPinned), desc(notes.updatedAt));
}

export async function updateNote(id: number, userId: number, data: Partial<{ title: string; content: string; color: string; isPinned: boolean }>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(notes).set(data).where(and(eq(notes.id, id), eq(notes.userId, userId)));
}

export async function deleteNote(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
}

export async function getNotesByIds(ids: number[], userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notes).where(eq(notes.userId, userId));
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export async function createTask(data: {
  userId: number; documentId?: number; title: string; description?: string;
  dueDate?: Date; priority?: "low" | "medium" | "high"; type?: "assignment" | "exam" | "reading" | "other";
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(tasks).values(data);
}

export async function getTasksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(tasks.dueDate, desc(tasks.createdAt));
}

export async function updateTask(id: number, userId: number, data: Partial<{
  title: string; description: string; dueDate: Date;
  priority: "low" | "medium" | "high"; status: "todo" | "in_progress" | "done";
  type: "assignment" | "exam" | "reading" | "other";
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(tasks).set(data).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.delete(taskSubtasks).where(and(eq(taskSubtasks.taskId, id), eq(taskSubtasks.userId, userId)));
  } catch (err) {
    console.warn('[DB] task_subtasks table delete failed:', err);
  }
  try {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  } catch (err) {
    console.warn('[DB] tasks table delete failed:', err);
  }
}

export async function getSubtasksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(taskSubtasks).where(eq(taskSubtasks.userId, userId)).orderBy(taskSubtasks.orderIndex, taskSubtasks.createdAt);
  } catch (err) {
    console.warn('[DB] task_subtasks table not ready:', err);
    return [];
  }
}

export async function createSubtasks(items: { taskId: number; userId: number; title: string; orderIndex: number }[]) {
  const db = await getDb();
  if (!db) return;
  if (items.length) {
    try {
      await db.insert(taskSubtasks).values(items);
    } catch (err) {
      console.warn('[DB] task_subtasks table not ready, skipping save:', err);
    }
  }
}

export async function updateSubtask(id: number, userId: number, data: Partial<{ title: string; isDone: boolean; orderIndex: number }>) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(taskSubtasks).set(data).where(and(eq(taskSubtasks.id, id), eq(taskSubtasks.userId, userId)));
  } catch (err) {
    console.warn('[DB] task_subtasks table update failed:', err);
  }
}

export async function deleteSubtask(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.delete(taskSubtasks).where(and(eq(taskSubtasks.id, id), eq(taskSubtasks.userId, userId)));
  } catch (err) {
    console.warn('[DB] task_subtasks table delete failed:', err);
  }
}

// ── Timer Sessions ─────────────────────────────────────────────────────────
export async function saveTimerSession(userId: number, sessionType: "work" | "short_break" | "long_break", durationMinutes: number) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(timerSessions).values({ userId, sessionType, durationMinutes });
  } catch (err) {
    console.warn('[DB] timerSessions table not ready, skipping save:', err);
  }
}

export async function getTimerHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(timerSessions).where(eq(timerSessions.userId, userId)).orderBy(desc(timerSessions.createdAt)).limit(50);
  } catch (err) {
    console.warn('[DB] timerSessions table not ready:', err);
    return [];
  }
}

// ── AI Outputs ─────────────────────────────────────────────────────────────
export async function saveAiOutput(userId: number, documentId: number, outputType: string, content: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(aiOutputs).values({ userId, documentId, outputType: outputType as any, content });
}

export async function getAiOutput(userId: number, documentId: number, outputType: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aiOutputs)
    .where(and(eq(aiOutputs.userId, userId), eq(aiOutputs.documentId, documentId), eq(aiOutputs.outputType, outputType as any)))
    .orderBy(desc(aiOutputs.createdAt)).limit(1);
  return result[0];
}

// ── Share Tokens ───────────────────────────────────────────────────────────
export async function createShareToken(data: {
  userId: number; token: string; noteIds: string;
  recipientEmail?: string; recipientPhone?: string; expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(shareTokens).values(data);
}

export async function getShareToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(shareTokens).where(eq(shareTokens.token, token)).limit(1);
  return result[0];
}

// ── Public Explore / Sharing ───────────────────────────────────────────────
export async function publishDeck(deckId: number, userId: number, opts: {
  isPublic: boolean; description?: string; subject?: string; shareSlug: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(flashcardDecks)
    .set({ isPublic: opts.isPublic, description: opts.description, subject: opts.subject, shareSlug: opts.shareSlug })
    .where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)));
}

export async function publishNote(noteId: number, userId: number, opts: {
  isPublic: boolean; subject?: string; shareSlug: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(notes)
    .set({ isPublic: opts.isPublic, subject: opts.subject, shareSlug: opts.shareSlug })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

export async function getPublicDecks(limit = 40, subject?: string) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select({
    id: flashcardDecks.id,
    title: flashcardDecks.title,
    description: flashcardDecks.description,
    subject: flashcardDecks.subject,
    cardCount: flashcardDecks.cardCount,
    shareSlug: flashcardDecks.shareSlug,
    createdAt: flashcardDecks.createdAt,
    authorName: users.name,
    authorId: users.id,
  })
    .from(flashcardDecks)
    .leftJoin(users, eq(flashcardDecks.userId, users.id))
    .where(eq(flashcardDecks.isPublic, true))
    .orderBy(desc(flashcardDecks.createdAt))
    .limit(limit);
  return query;
}

export async function getPublicNotes(limit = 40, subject?: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: notes.id,
    title: notes.title,
    subject: notes.subject,
    shareSlug: notes.shareSlug,
    color: notes.color,
    createdAt: notes.createdAt,
    authorName: users.name,
    authorId: users.id,
    // Truncated preview — first 200 chars
    preview: notes.content,
  })
    .from(notes)
    .leftJoin(users, eq(notes.userId, users.id))
    .where(eq(notes.isPublic, true))
    .orderBy(desc(notes.createdAt))
    .limit(limit);
}

export async function getDeckBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(flashcardDecks)
    .where(and(eq(flashcardDecks.shareSlug, slug), eq(flashcardDecks.isPublic, true))).limit(1);
  return result[0];
}

export async function getNoteBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(notes)
    .where(and(eq(notes.shareSlug, slug), eq(notes.isPublic, true))).limit(1);
  return result[0];
}

export async function getPublicCardsByDeck(deckId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(flashcards).where(eq(flashcards.deckId, deckId));
}

export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result[0] ?? null;
}

// ── Voice Notes ───────────────────────────────────────────────────────────
export async function createVoiceNote(data: {
  userId: number; title: string; s3Key: string; s3Url: string; duration: number; transcript?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(voiceNotes).values(data);
  return result[0];
}

export async function getVoiceNotesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(voiceNotes).where(eq(voiceNotes.userId, userId)).orderBy(desc(voiceNotes.createdAt));
}

export async function updateVoiceNoteTranscript(id: number, userId: number, transcript: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(voiceNotes).set({ transcript }).where(and(eq(voiceNotes.id, id), eq(voiceNotes.userId, userId)));
}

export async function deleteVoiceNote(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(voiceNotes).where(and(eq(voiceNotes.id, id), eq(voiceNotes.userId, userId)));
}

// ── Video Notes ───────────────────────────────────────────────────────────
export async function createVideoNote(data: {
  userId: number; title: string; s3Key: string; s3Url: string; duration: number; videoMimeType: string; transcript?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(videoNotes).values(data);
    return result[0];
  } catch (err) {
    console.warn('[DB] video_notes table not ready, skipping save:', err);
    return null;
  }
}

export async function getVideoNotesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(videoNotes).where(eq(videoNotes.userId, userId)).orderBy(desc(videoNotes.createdAt));
  } catch (err) {
    console.warn('[DB] video_notes table query failed:', err);
    return [];
  }
}

export async function countVideoNotesByUser(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const rows = await db.select().from(videoNotes).where(eq(videoNotes.userId, userId));
    return rows.length;
  } catch (err) {
    console.warn('[DB] video_notes table query failed:', err);
    return 0;
  }
}

export async function updateVideoNoteTranscript(id: number, userId: number, transcript: string) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(videoNotes).set({ transcript }).where(and(eq(videoNotes.id, id), eq(videoNotes.userId, userId)));
  } catch (err) {
    console.warn('[DB] video_notes table update failed:', err);
  }
}

export async function deleteVideoNote(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.delete(videoNotes).where(and(eq(videoNotes.id, id), eq(videoNotes.userId, userId)));
  } catch (err) {
    console.warn('[DB] video_notes table delete failed:', err);
  }
}

export async function upsertUserSettings(userId: number, data: {
  notificationEmail?: string;
  notificationPhone?: string;
  notifyFrequency?: "every_hour" | "24_hours_before" | "as_approaching" | "every_few_days" | "disabled";
  notifyEnabled?: boolean;
  shareDeadlinesEnabled?: boolean;
  shareDeadlinesRecipients?: string;
  displayName?: string;
  bio?: string;
  accentColor?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  const values: Record<string, unknown> = { userId };
  const updateSet: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      values[k] = v === "" ? null : v;
      updateSet[k] = v === "" ? null : v;
    }
  }
  await db.insert(userSettings).values(values as Parameters<typeof db.insert>[0] extends infer T ? T extends { values: (v: infer V) => unknown } ? V : never : never).onDuplicateKeyUpdate({ set: updateSet });
}

// ── Note Folders ──────────────────────────────────────────────────────────
export async function createNoteFolder(userId: number, name: string, color?: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(noteFolders).values({ userId, name, color: color ?? "#3b9edd" });
  return (result as any)[0]?.insertId ?? null;
}

export async function getNoteFoldersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(noteFolders).where(eq(noteFolders.userId, userId)).orderBy(desc(noteFolders.isPinned), noteFolders.createdAt);
}

export async function updateNoteFolder(id: number, userId: number, data: { name?: string; color?: string; isPinned?: boolean }) {
  const db = await getDb();
  if (!db) return;
  await db.update(noteFolders).set(data).where(and(eq(noteFolders.id, id), eq(noteFolders.userId, userId)));
}

export async function deleteNoteFolder(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  // Unset folderId on all notes in this folder first
  await db.update(notes).set({ folderId: null }).where(and(eq(notes.folderId, id), eq(notes.userId, userId)));
  await db.delete(noteFolders).where(and(eq(noteFolders.id, id), eq(noteFolders.userId, userId)));
}

export async function moveNoteToFolder(noteId: number, userId: number, folderId: number | null) {
  const db = await getDb();
  if (!db) return;
  await db.update(notes).set({ folderId }).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}
