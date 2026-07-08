import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { studyRooms } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const MAX_DURATION_MINUTES = 30;

export const studyRoomsRouter = router({
  // Create a new study room. Duration is capped server-side at 30 minutes
  // regardless of what the client sends.
  create: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1).max(256),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const roomCode = nanoid(10);
      await db.insert(studyRooms).values({
        hostUserId: ctx.user.id,
        roomCode,
        topic: input.topic,
        durationMinutes: MAX_DURATION_MINUTES,
      });

      return { roomCode, durationMinutes: MAX_DURATION_MINUTES };
    }),

  // List rooms this user has hosted, most recent first.
  listMine: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(studyRooms)
        .where(eq(studyRooms.hostUserId, ctx.user.id))
        .orderBy(desc(studyRooms.createdAt))
        .limit(20);
    } catch (error) {
      console.error('[StudyRooms] Error listing rooms:', error);
      return [];
    }
  }),

  // Look up a room by its shareable code. Public so a study partner who
  // isn't the host can still join via the link.
  getByCode: publicProcedure
    .input(z.object({ roomCode: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;
        const rows = await db
          .select()
          .from(studyRooms)
          .where(eq(studyRooms.roomCode, input.roomCode))
          .limit(1);
        return rows[0] ?? null;
      } catch (error) {
        console.error('[StudyRooms] Error fetching room:', error);
        return null;
      }
    }),
});
