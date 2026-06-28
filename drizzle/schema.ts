import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  float,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  acceptedTermsAt: timestamp("acceptedTermsAt"),
  termsVersion: varchar("termsVersion", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  filename: varchar("filename", { length: 512 }).notNull(),
  originalName: varchar("originalName", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  fileKey: varchar("fileKey", { length: 1024 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  fileSize: int("fileSize").default(0),
  extractedText: text("extractedText"),
  wordCount: int("wordCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const sourceItems = mysqlTable("source_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  externalId: varchar("externalId", { length: 255 }).notNull(),
  title: text("title").notNull(),
  abstract: text("abstract"),
  url: text("url"),
  authorsJson: json("authorsJson"),
  license: varchar("license", { length: 255 }),
  contentType: varchar("contentType", { length: 64 }),
  importedDocumentId: int("importedDocumentId"),
  metadataJson: json("metadataJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const studyOutputs = mysqlTable("study_outputs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  templateType: varchar("templateType", { length: 64 }).notNull(),
  documentIdsJson: json("documentIdsJson"),
  sourceNamesJson: json("sourceNamesJson"),
  content: text("content").notNull(),
  depth: varchar("depth", { length: 32 }),
  examContext: varchar("examContext", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const studyActivity = mysqlTable("study_activity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityType: varchar("activityType", { length: 64 }).notNull(),
  count: int("count").default(1).notNull(),
  activityDate: varchar("activityDate", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const flashcardDecks = mysqlTable("flashcard_decks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentId: int("documentId"),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  isPublic: boolean("isPublic").default(false).notNull(),
  shareSlug: varchar("shareSlug", { length: 128 }).unique(),
  subject: varchar("subject", { length: 128 }),
  cardCount: int("cardCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const flashcards = mysqlTable("flashcards", {
  id: int("id").autoincrement().primaryKey(),
  deckId: int("deckId").notNull(),
  userId: int("userId").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  // Spaced repetition fields (SM-2)
  interval: int("interval").default(1).notNull(),
  repetitions: int("repetitions").default(0).notNull(),
  easeFactor: float("easeFactor").default(2.5).notNull(),
  dueDate: timestamp("dueDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const quizSessions = mysqlTable("quiz_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deckId: int("deckId").notNull(),
  documentId: int("documentId"),
  totalCards: int("totalCards").default(0).notNull(),
  knownCount: int("knownCount").default(0).notNull(),
  needsWorkCount: int("needsWorkCount").default(0).notNull(),
  scorePercent: int("scorePercent").default(0).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quizMeReports = mysqlTable("quiz_me_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentId: int("documentId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  questionCount: int("questionCount").default(0).notNull(),
  scorePercent: int("scorePercent").default(0).notNull(),
  mcqScore: int("mcqScore").default(0).notNull(),
  shortAnswerScore: int("shortAnswerScore").default(0).notNull(),
  answersJson: json("answersJson"),
  flagsJson: json("flagsJson"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentId: int("documentId"),
  title: varchar("title", { length: 256 }).default("Untitled Note").notNull(),
  content: text("content").notNull(),
  color: varchar("color", { length: 32 }).default("#fef3c7").notNull(),
  folderId: int("folderId"),
  isPinned: boolean("isPinned").default(false).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  shareSlug: varchar("shareSlug", { length: 128 }).unique(),
  subject: varchar("subject", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentId: int("documentId"),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "done"]).default("todo").notNull(),
  type: mysqlEnum("type", ["assignment", "exam", "reading", "other"]).default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const taskSubtasks = mysqlTable("task_subtasks", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  isDone: boolean("isDone").default(false).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const timerSessions = mysqlTable("timer_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionType: mysqlEnum("sessionType", ["work", "short_break", "long_break"]).default("work").notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const aiOutputs = mysqlTable("ai_outputs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentId: int("documentId").notNull(),
  outputType: mysqlEnum("outputType", [
    "flashcards",
    "cornell_notes",
    "mind_map",
    "timeline",
    "flowchart",
    "key_points",
    "study_plan",
    "deadlines",
    "simulation",
  ]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const shareTokens = mysqlTable("share_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  noteIds: text("noteIds").notNull(), // JSON array of note IDs
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  recipientPhone: varchar("recipientPhone", { length: 32 }),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type SourceItem = typeof sourceItems.$inferSelect;
export type InsertSourceItem = typeof sourceItems.$inferInsert;
export type StudyOutput = typeof studyOutputs.$inferSelect;
export type InsertStudyOutput = typeof studyOutputs.$inferInsert;
export type StudyActivity = typeof studyActivity.$inferSelect;
export type InsertStudyActivity = typeof studyActivity.$inferInsert;
export type Flashcard = typeof flashcards.$inferSelect;
export type FlashcardDeck = typeof flashcardDecks.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskSubtask = typeof taskSubtasks.$inferSelect;
export type InsertTaskSubtask = typeof taskSubtasks.$inferInsert;
export type TimerSession = typeof timerSessions.$inferSelect;
export type AiOutput = typeof aiOutputs.$inferSelect;
export type QuizMeReport = typeof quizMeReports.$inferSelect;
export type InsertQuizMeReport = typeof quizMeReports.$inferInsert;
export type FlashcardDeckWithCount = FlashcardDeck & { cardCount: number };

export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Notification preferences
  notificationEmail: varchar("notificationEmail", { length: 320 }),
  notificationPhone: varchar("notificationPhone", { length: 32 }),
  notifyFrequency: mysqlEnum("notifyFrequency", [
    "every_hour",
    "24_hours_before",
    "as_approaching",
    "every_few_days",
    "disabled",
  ]).default("as_approaching").notNull(),
  notifyEnabled: boolean("notifyEnabled").default(false).notNull(),
  // Deadline sharing
  shareDeadlinesEnabled: boolean("shareDeadlinesEnabled").default(false).notNull(),
  shareDeadlinesRecipients: text("shareDeadlinesRecipients"), // JSON array of {name, email/phone}
  // Account
  accentColor: varchar("accentColor", { length: 16 }), // user-chosen accent hex
  displayName: varchar("displayName", { length: 128 }),
  bio: text("bio"),
  isDeactivated: boolean("isDeactivated").default(false).notNull(),
  deactivatedAt: timestamp("deactivatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

export const voiceNotes = mysqlTable("voice_notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).default("Voice Note").notNull(),
  s3Key: varchar("s3Key", { length: 1024 }).notNull(),
  s3Url: text("s3Url").notNull(),
  duration: int("duration").default(0).notNull(), // seconds
  transcript: text("transcript"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const videoNotes = mysqlTable("video_notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).default("Video Note").notNull(),
  s3Key: varchar("s3Key", { length: 1024 }).notNull(),
  s3Url: text("s3Url").notNull(),
  duration: int("duration").default(0).notNull(), // seconds
  videoMimeType: varchar("videoMimeType", { length: 128 }).default("video/webm").notNull(),
  transcript: text("transcript"),
  chapters: json("chapters").default([]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VoiceNote = typeof voiceNotes.$inferSelect;
export type InsertVoiceNote = typeof voiceNotes.$inferInsert;
export type VideoNote = typeof videoNotes.$inferSelect;
export type InsertVideoNote = typeof videoNotes.$inferInsert;

export const noteFolders = mysqlTable("note_folders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  color: varchar("color", { length: 32 }).default("#3b9edd").notNull(),
  isPinned: boolean("isPinned").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NoteFolder = typeof noteFolders.$inferSelect;
export type InsertNoteFolder = typeof noteFolders.$inferInsert;

// Web Push subscriptions (one per browser/device per user)
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscriptionRow = typeof pushSubscriptions.$inferInsert;

// CourseGraph: Knowledge Graph Tables
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  syllabus: text("syllabus"), // Course syllabus/description
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  parentTopicId: int("parentTopicId"), // For subtopics
  masteryScore: float("masteryScore").default(0).notNull(), // 0-100%
  lastReviewedAt: timestamp("lastReviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const topicAssets = mysqlTable("topicAssets", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  userId: int("userId").notNull(),
  assetType: mysqlEnum("assetType", [
    "document",
    "note",
    "flashcard_deck",
    "quiz_result",
    "voice_note",
    "video_note",
    "source_item",
  ]).notNull(),
  assetId: int("assetId").notNull(), // FK to the actual asset table
  weight: float("weight").default(1).notNull(), // Importance multiplier
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const masteryHistory = mysqlTable("masteryHistory", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  userId: int("userId").notNull(),
  score: float("score").notNull(), // 0-100%
  source: mysqlEnum("source", [
    "quiz_result",
    "flashcard_review",
    "manual_update",
    "ai_assessment",
  ]).notNull(),
  evidence: text("evidence"), // JSON: {quizId, deckId, etc.}
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const topicDependencies = mysqlTable("topicDependencies", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  userId: int("userId").notNull(),
  dependsOnTopicId: int("dependsOnTopicId").notNull(),
  weight: float("weight").default(1).notNull(), // Strength of dependency
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const courseGraphExports = mysqlTable("courseGraphExports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exportType: mysqlEnum("exportType", ["json", "csv", "svg"]).notNull(),
  data: text("data").notNull(), // Serialized export data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Types
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;
export type TopicAsset = typeof topicAssets.$inferSelect;
export type InsertTopicAsset = typeof topicAssets.$inferInsert;
export type MasteryHistoryRow = typeof masteryHistory.$inferSelect;
export type InsertMasteryHistoryRow = typeof masteryHistory.$inferInsert;
export type TopicDependency = typeof topicDependencies.$inferSelect;
export type InsertTopicDependency = typeof topicDependencies.$inferInsert;
export type CourseGraphExport = typeof courseGraphExports.$inferSelect;
export type InsertCourseGraphExport = typeof courseGraphExports.$inferInsert;
