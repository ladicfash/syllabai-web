import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { courses, topics, topicAssets, masteryHistory, courseGraphExports } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const courseGraphRouter = router({
  // Get all courses for user
  getCourses: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      const userCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.userId, ctx.user.id));
      return userCourses;
    } catch (error) {
      console.error('[CourseGraph] Error fetching courses:', error);
      return [];
    }
  }),

  // Create new course
  createCourse: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        syllabus: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.insert(courses).values({
          userId: ctx.user.id,
          name: input.name,
          syllabus: input.syllabus,
          startDate: input.startDate,
          endDate: input.endDate,
        });
        return { success: true, message: 'Course created' };
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
        
        const courseTopics = await db
          .select()
          .from(topics)
          .where(
            and(
              eq(topics.courseId, input.courseId),
              eq(topics.userId, ctx.user.id)
            )
          );
        return courseTopics;
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
        return { success: true, message: 'Topic created' };
      } catch (error) {
        console.error('[CourseGraph] Error creating topic:', error);
        throw new Error('Failed to create topic');
      }
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
        
        // Record history
        await db.insert(masteryHistory).values({
          topicId: input.topicId,
          userId: ctx.user.id,
          score: input.score,
          source: input.source,
          evidence: input.evidence,
        });

        // Update topic mastery (simple average for now)
        const history = await db
          .select()
          .from(masteryHistory)
          .where(
            and(
              eq(masteryHistory.topicId, input.topicId),
              eq(masteryHistory.userId, ctx.user.id)
            )
          );

        const avgScore =
          history.reduce((sum: number, h: any) => sum + h.score, 0) / history.length;

        await db
          .update(topics)
          .set({ masteryScore: avgScore })
          .where(eq(topics.id, input.topicId));

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
        
        const userCourses = await db
          .select()
          .from(courses)
          .where(eq(courses.userId, ctx.user.id));

        const userTopics = await db
          .select()
          .from(topics)
          .where(eq(topics.userId, ctx.user.id));

        const userMastery = await db
          .select()
          .from(masteryHistory)
          .where(eq(masteryHistory.userId, ctx.user.id));

        const exportData = {
          exportedAt: new Date().toISOString(),
          user: {
            id: ctx.user.id,
            name: ctx.user.name,
            email: ctx.user.email,
          },
          courses: userCourses,
          topics: userTopics,
          masteryHistory: userMastery,
        };

        // Store export record for audit trail
        await db.insert(courseGraphExports).values({
          userId: ctx.user.id,
          exportType: input.format,
          data: JSON.stringify(exportData),
        });

        if (input.format === 'json') {
          return {
            success: true,
            data: exportData,
            filename: `syllabai-data-${new Date().toISOString().split('T')[0]}.json`,
          };
        } else if (input.format === 'csv') {
          // Convert to CSV format
          const csv = convertToCSV(exportData);
          return {
            success: true,
            data: csv,
            filename: `syllabai-data-${new Date().toISOString().split('T')[0]}.csv`,
          };
        }

        return { success: true, data: exportData };
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
      
      // Delete all user's CourseGraph data
      await db.delete(courseGraphExports).where(eq(courseGraphExports.userId, ctx.user.id));
      await db.delete(masteryHistory).where(eq(masteryHistory.userId, ctx.user.id));
      await db.delete(topicAssets).where(eq(topicAssets.userId, ctx.user.id));
      await db.delete(topics).where(eq(topics.userId, ctx.user.id));
      await db.delete(courses).where(eq(courses.userId, ctx.user.id));

      return { success: true, message: 'All CourseGraph data deleted' };
    } catch (error) {
      console.error('[CourseGraph] Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }),

  // 21st.dev: Generate component variations
  generateComponentVariations: protectedProcedure
    .input(
      z.object({
        componentType: z.enum(['dashboard', 'card', 'chart', 'form']),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Call 21st.dev Magic API
        const response = await fetch('https://api.21st.dev/v1/magic/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TWENTYFIRST_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: `Generate a React component for: ${input.description}. Component type: ${input.componentType}. Use TypeScript and Tailwind CSS.`,
            style: 'modern',
            framework: 'react',
          }),
        });

        if (!response.ok) {
          throw new Error(`21st.dev API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          success: true,
          component: data.component,
          variations: data.variations || [],
        };
      } catch (error) {
        console.error('[CourseGraph] Error generating component:', error);
        return {
          success: false,
          error: 'Failed to generate component variations',
        };
      }
    }),
});

// Helper: Convert export data to CSV
function convertToCSV(data: any): string {
  const rows: string[] = [];

  // Topics CSV
  rows.push('Topic ID,Course ID,Name,Mastery Score,Last Reviewed');
  data.topics.forEach((topic: any) => {
    rows.push(
      `${topic.id},${topic.courseId},"${topic.name}",${topic.masteryScore},${topic.lastReviewedAt || 'Never'}`
    );
  });

  rows.push('');
  rows.push('Mastery History ID,Topic ID,Score,Source,Timestamp');
  data.masteryHistory.forEach((entry: any) => {
    rows.push(
      `${entry.id},${entry.topicId},${entry.score},${entry.source},${entry.timestamp}`
    );
  });

  return rows.join('\n');
}
