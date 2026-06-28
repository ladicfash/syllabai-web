import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { courses, topics, topicAssets, masteryHistory, courseGraphExports } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { invokeLLM } from '../_core/llm';
import { PDFParse } from 'pdf-parse';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function docxBufferToText(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid top-level issues
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    return '';
  }
}

async function extractTextFromFile(
  base64: string,
  mimeType: string
): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');
  if (mimeType === 'application/pdf') {
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    const result = await parser.getText();
    await parser.destroy();
    return result.text.trim();
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return docxBufferToText(buffer);
  }
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }
  return '';
}

async function callLLMJson(systemPrompt: string, userContent: string, schema: Record<string, unknown>): Promise<string> {
  const res = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'response', strict: true, schema },
    },
    max_tokens: 2000,
  });
  const choice: any = res?.choices?.[0];
  const content = choice?.message?.content;
  if (!content) throw new Error('AI returned no content');
  return typeof content === 'string' ? content.trim() : JSON.stringify(content);
}

// ── Router ────────────────────────────────────────────────────────────────────

export const courseGraphRouter = router({
  // Get all courses for user
  getCourses: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(courses).where(eq(courses.userId, ctx.user.id));
    } catch (error) {
      console.error('[CourseGraph] Error fetching courses:', error);
      return [];
    }
  }),

  // Create new course — returns the inserted row id
  createCourse: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        syllabus: z.string().optional(),
        syllabusFileKey: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const result = await db.insert(courses).values({
          userId: ctx.user.id,
          name: input.name,
          syllabus: input.syllabus,
          startDate: input.startDate,
          endDate: input.endDate,
        });
        // Return the new course id (insertId for MySQL)
        const insertId = (result as any).insertId ?? (result as any)[0]?.insertId;
        return { success: true, courseId: Number(insertId) };
      } catch (error) {
        console.error('[CourseGraph] Error creating course:', error);
        throw new Error('Failed to create course');
      }
    }),

  // Get topics for a course
  getTopics: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        return db
          .select()
          .from(topics)
          .where(and(eq(topics.courseId, input.courseId), eq(topics.userId, ctx.user.id)));
      } catch (error) {
        console.error('[CourseGraph] Error fetching topics:', error);
        return [];
      }
    }),

  // Create topic
  createTopic: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        name: z.string().min(1).max(256),
        description: z.string().optional(),
        parentTopicId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await db.insert(topics).values({
          courseId: input.courseId,
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          parentTopicId: input.parentTopicId,
          masteryScore: 0,
        });
        return { success: true };
      } catch (error) {
        console.error('[CourseGraph] Error creating topic:', error);
        throw new Error('Failed to create topic');
      }
    }),

  // Bulk-create topics from AI extraction result
  bulkCreateTopics: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        topics: z.array(
          z.object({
            name: z.string().min(1).max(256),
            description: z.string().optional(),
            parentName: z.string().optional(), // used to resolve parent after insert
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        // Insert root topics first, then children
        const nameToId = new Map<string, number>();

        // Pass 1: root topics (no parent)
        for (const t of input.topics.filter((t) => !t.parentName)) {
          const res = await db.insert(topics).values({
            courseId: input.courseId,
            userId: ctx.user.id,
            name: t.name,
            description: t.description,
            masteryScore: 0,
          });
          const id = Number((res as any).insertId ?? (res as any)[0]?.insertId);
          nameToId.set(t.name, id);
        }

        // Pass 2: child topics
        for (const t of input.topics.filter((t) => !!t.parentName)) {
          const parentId = nameToId.get(t.parentName!);
          await db.insert(topics).values({
            courseId: input.courseId,
            userId: ctx.user.id,
            name: t.name,
            description: t.description,
            parentTopicId: parentId,
            masteryScore: 0,
          });
        }

        return { success: true, count: input.topics.length };
      } catch (error) {
        console.error('[CourseGraph] Error bulk-creating topics:', error);
        throw new Error('Failed to create topics');
      }
    }),

  // AI: Extract topics from syllabus text or uploaded file
  extractTopics: protectedProcedure
    .input(
      z.object({
        // Either pass raw text OR a base64 file
        text: z.string().optional(),
        fileBase64: z.string().optional(),
        filename: z.string().optional(),
        mimeType: z.string().optional(),
        // Optional extra context from connected docs
        extraText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let sourceText = input.text ?? '';

      // Extract text from uploaded file if provided
      if (input.fileBase64 && input.mimeType) {
        try {
          const extracted = await extractTextFromFile(input.fileBase64, input.mimeType);
          sourceText = extracted + (input.extraText ? '\n\n' + input.extraText : '');
        } catch (err) {
          console.error('[CourseGraph] Text extraction failed:', err);
          throw new Error('Could not extract text from the uploaded file.');
        }
      } else if (input.extraText) {
        sourceText = sourceText + '\n\n' + input.extraText;
      }

      if (!sourceText || sourceText.trim().length < 30) {
        throw new Error('Not enough text to extract topics from. Please upload a syllabus or add document text.');
      }

      const schema = {
        type: 'object',
        properties: {
          courseName: { type: 'string' },
          topics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                parentName: { type: 'string' },
                isRoot: { type: 'boolean' },
              },
              required: ['name', 'description', 'isRoot'],
              additionalProperties: false,
            },
          },
        },
        required: ['courseName', 'topics'],
        additionalProperties: false,
      };

      const raw = await callLLMJson(
        `You are an expert academic curriculum analyst. Extract the main topics and subtopics from this course syllabus or study material. 
Identify 5-15 key topics. For each topic, provide a short description (1-2 sentences). 
Organize them hierarchically: root topics (isRoot: true) and subtopics (isRoot: false, parentName = name of parent topic).
Also infer the course name if not explicitly stated.
Return JSON only.`,
        sourceText.slice(0, 8000),
        schema
      );

      const parsed = JSON.parse(raw);
      return {
        courseName: parsed.courseName as string,
        topics: parsed.topics as Array<{
          name: string;
          description: string;
          parentName?: string;
          isRoot: boolean;
        }>,
        wordCount: sourceText.split(/\s+/).filter(Boolean).length,
      };
    }),

  // Update mastery score
  updateMastery: protectedProcedure
    .input(
      z.object({
        topicId: z.number(),
        score: z.number().min(0).max(100),
        source: z.enum(['quiz_result', 'flashcard_review', 'manual_update', 'ai_assessment']),
        evidence: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        await db.insert(masteryHistory).values({
          topicId: input.topicId,
          userId: ctx.user.id,
          score: input.score,
          source: input.source,
          evidence: input.evidence,
        });

        const history = await db
          .select()
          .from(masteryHistory)
          .where(and(eq(masteryHistory.topicId, input.topicId), eq(masteryHistory.userId, ctx.user.id)));

        const avgScore = history.reduce((sum: number, h: any) => sum + h.score, 0) / history.length;

        await db.update(topics).set({ masteryScore: avgScore }).where(eq(topics.id, input.topicId));

        return { success: true, newScore: avgScore };
      } catch (error) {
        console.error('[CourseGraph] Error updating mastery:', error);
        throw new Error('Failed to update mastery');
      }
    }),

  // GDPR: Export user data
  exportUserData: protectedProcedure
    .input(z.object({ format: z.enum(['json', 'csv', 'svg']) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const userCourses = await db.select().from(courses).where(eq(courses.userId, ctx.user.id));
        const userTopics = await db.select().from(topics).where(eq(topics.userId, ctx.user.id));
        const userMastery = await db.select().from(masteryHistory).where(eq(masteryHistory.userId, ctx.user.id));

        const exportData = {
          exportedAt: new Date().toISOString(),
          user: { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email },
          courses: userCourses,
          topics: userTopics,
          masteryHistory: userMastery,
        };

        await db.insert(courseGraphExports).values({
          userId: ctx.user.id,
          exportType: input.format,
          data: JSON.stringify(exportData),
        });

        if (input.format === 'csv') {
          return { success: true, data: convertToCSV(exportData), filename: `syllabai-data-${new Date().toISOString().split('T')[0]}.csv` };
        }
        return { success: true, data: exportData, filename: `syllabai-data-${new Date().toISOString().split('T')[0]}.json` };
      } catch (error) {
        console.error('[CourseGraph] Error exporting data:', error);
        throw new Error('Failed to export data');
      }
    }),

  // GDPR: Delete user data
  deleteUserData: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.delete(courseGraphExports).where(eq(courseGraphExports.userId, ctx.user.id));
      await db.delete(masteryHistory).where(eq(masteryHistory.userId, ctx.user.id));
      await db.delete(topicAssets).where(eq(topicAssets.userId, ctx.user.id));
      await db.delete(topics).where(eq(topics.userId, ctx.user.id));
      await db.delete(courses).where(eq(courses.userId, ctx.user.id));
      return { success: true };
    } catch (error) {
      console.error('[CourseGraph] Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }),

  // 21st.dev: Generate component variations
  generateComponentVariations: protectedProcedure
    .input(z.object({ componentType: z.enum(['dashboard', 'card', 'chart', 'form']), description: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch('https://api.21st.dev/v1/magic/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.TWENTYFIRST_API_KEY}` },
          body: JSON.stringify({
            prompt: `Generate a React component for: ${input.description}. Component type: ${input.componentType}. Use TypeScript and Tailwind CSS.`,
            style: 'modern',
            framework: 'react',
          }),
        });
        if (!response.ok) throw new Error(`21st.dev API error: ${response.statusText}`);
        const data = await response.json();
        return { success: true, component: data.component, variations: data.variations || [] };
      } catch (error) {
        console.error('[CourseGraph] Error generating component:', error);
        return { success: false, error: 'Failed to generate component variations' };
      }
    }),
});

// Helper: Convert export data to CSV
function convertToCSV(data: any): string {
  const rows: string[] = [];
  rows.push('Topic ID,Course ID,Name,Mastery Score,Last Reviewed');
  data.topics.forEach((topic: any) => {
    rows.push(`${topic.id},${topic.courseId},"${topic.name}",${topic.masteryScore},${topic.lastReviewedAt || 'Never'}`);
  });
  rows.push('');
  rows.push('Mastery History ID,Topic ID,Score,Source,Timestamp');
  data.masteryHistory.forEach((entry: any) => {
    rows.push(`${entry.id},${entry.topicId},${entry.score},${entry.source},${entry.timestamp}`);
  });
  return rows.join('\n');
}
