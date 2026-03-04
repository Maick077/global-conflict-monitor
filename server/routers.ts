import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createEvent,
  getEventById,
  getConfirmedEvents,
  getEventsByCountry,
  getEventsByType,
  getEventsByDateRange,
  updateEvent,
  deleteEvent,
  confirmEvent,
  getEventStats,
} from "./db";

// Validation schemas
const eventInputSchema = z.object({
  type: z.enum(["aéreo", "terrestre", "marítimo"]),
  country: z.enum(["iran", "israel"]),
  description: z.string().min(10).max(1000),
  sourceName: z.string().min(1).max(255),
  sourceUrl: z.string().url(),
  latitude: z.number().min(-90).max(90).transform(n => n.toString()),
  longitude: z.number().min(-180).max(180).transform(n => n.toString()),
  locationName: z.string().min(1).max(255),
  eventDate: z.date(),
});

// Admin-only procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can perform this action",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  events: router({
    // Get all confirmed events
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return getConfirmedEvents(input.limit, input.offset);
      }),

    // Get event by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const event = await getEventById(input.id);
        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        }
        return event;
      }),

    // Filter by country
    byCountry: publicProcedure
      .input(z.object({
        country: z.enum(["iran", "israel"]),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return getEventsByCountry(input.country, input.limit, input.offset);
      }),

    // Filter by type
    byType: publicProcedure
      .input(z.object({
        type: z.enum(["aéreo", "terrestre", "marítimo"]),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return getEventsByType(input.type, input.limit, input.offset);
      }),

    // Filter by date range
    byDateRange: publicProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        if (input.startDate > input.endDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Start date must be before end date",
          });
        }
        return getEventsByDateRange(input.startDate, input.endDate, input.limit, input.offset);
      }),

    // Get statistics
    stats: publicProcedure.query(async () => {
      return getEventStats();
    }),

    // Create event (admin only)
    create: adminProcedure
      .input(eventInputSchema)
      .mutation(async ({ input }) => {
        return createEvent({
          ...input,
          confirmed: false,
        });
      }),

    // Update event (admin only)
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["aéreo", "terrestre", "marítimo"]).optional(),
        country: z.enum(["iran", "israel"]).optional(),
        description: z.string().min(10).max(1000).optional(),
        sourceName: z.string().min(1).max(255).optional(),
        sourceUrl: z.string().url().optional(),
        latitude: z.number().min(-90).max(90).transform(n => n.toString()).optional(),
        longitude: z.number().min(-180).max(180).transform(n => n.toString()).optional(),
        locationName: z.string().min(1).max(255).optional(),
        eventDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const event = await updateEvent(id, updates);
        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        }
        return event;
      }),

    // Delete event (admin only)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const success = await deleteEvent(input.id);
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        }
        return { success: true };
      }),

    // Confirm event (admin only)
    confirm: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User ID not found",
          });
        }
        const event = await confirmEvent(input.id, ctx.user.id);
        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        }
        return event;
      }),
  }),
});

export type AppRouter = typeof appRouter;
