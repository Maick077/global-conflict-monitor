import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user contexts
const adminUser = {
  id: 1,
  openId: "admin-user",
  email: "admin@example.com",
  name: "Admin User",
  loginMethod: "manus",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const regularUser = {
  id: 2,
  openId: "regular-user",
  email: "user@example.com",
  name: "Regular User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createContext(user: typeof adminUser | typeof regularUser | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("events router", () => {
  let createdEventId: number;

  describe("events.create", () => {
    it("should create an event as admin", async () => {
      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.create({
        type: "aéreo",
        country: "iran",
        description: "Test aerial event in Tehran",
        sourceName: "Reuters",
        sourceUrl: "https://reuters.com/test",
        latitude: 35.6892,
        longitude: 51.389,
        locationName: "Tehran, Iran",
        eventDate: new Date("2026-03-04T10:00:00Z"),
      });

      expect(result).toBeDefined();
      expect(result.type).toBe("aéreo");
      expect(result.country).toBe("iran");
      expect(result.confirmed).toBe(false);
      createdEventId = result.id;
    });

    it("should reject non-admin users", async () => {
      const ctx = createContext(regularUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.events.create({
          type: "terrestre",
          country: "israel",
          description: "Test ground event",
          sourceName: "BBC",
          sourceUrl: "https://bbc.com/test",
          latitude: 31.768,
          longitude: 35.214,
          locationName: "Jerusalem, Israel",
          eventDate: new Date(),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.events.create({
          type: "marítimo",
          country: "iran",
          description: "Test maritime event",
          sourceName: "AP",
          sourceUrl: "https://ap.org/test",
          latitude: 26.1207,
          longitude: 56.2669,
          locationName: "Persian Gulf",
          eventDate: new Date(),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("events.list", () => {
    it("should list confirmed events", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({ limit: 100, offset: 0 });

      expect(Array.isArray(result)).toBe(true);
      // All returned events should be confirmed
      result.forEach((event) => {
        expect(event.confirmed).toBe(true);
      });
    });

    it("should support pagination", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const page1 = await caller.events.list({ limit: 10, offset: 0 });
      const page2 = await caller.events.list({ limit: 10, offset: 10 });

      expect(page1.length).toBeLessThanOrEqual(10);
      expect(page2.length).toBeLessThanOrEqual(10);
    });
  });

  describe("events.byType", () => {
    it("should filter events by type", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const aerialEvents = await caller.events.byType({
        type: "aéreo",
        limit: 100,
        offset: 0,
      });

      expect(Array.isArray(aerialEvents)).toBe(true);
      aerialEvents.forEach((event) => {
        expect(event.type).toBe("aéreo");
        expect(event.confirmed).toBe(true);
      });
    });

    it("should filter by all event types", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);
      const types = ["aéreo", "terrestre", "marítimo"] as const;

      for (const type of types) {
        const events = await caller.events.byType({
          type,
          limit: 100,
          offset: 0,
        });

        expect(Array.isArray(events)).toBe(true);
        events.forEach((event) => {
          expect(event.type).toBe(type);
        });
      }
    });
  });

  describe("events.byCountry", () => {
    it("should filter events by country", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const iranEvents = await caller.events.byCountry({
        country: "iran",
        limit: 100,
        offset: 0,
      });

      expect(Array.isArray(iranEvents)).toBe(true);
      iranEvents.forEach((event) => {
        expect(event.country).toBe("iran");
        expect(event.confirmed).toBe(true);
      });
    });

    it("should filter by both countries", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const iranEvents = await caller.events.byCountry({
        country: "iran",
        limit: 100,
        offset: 0,
      });
      const israelEvents = await caller.events.byCountry({
        country: "israel",
        limit: 100,
        offset: 0,
      });

      iranEvents.forEach((event) => {
        expect(event.country).toBe("iran");
      });
      israelEvents.forEach((event) => {
        expect(event.country).toBe("israel");
      });
    });
  });

  describe("events.stats", () => {
    it("should return event statistics", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const stats = await caller.events.stats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe("number");
      expect(typeof stats.confirmed).toBe("number");
      expect(typeof stats.last24h).toBe("number");
      expect(typeof stats.byType).toBe("object");
      expect(typeof stats.byCountry).toBe("object");
    });

    it("should have valid stat counts", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const stats = await caller.events.stats();

      expect(stats.confirmed).toBeLessThanOrEqual(stats.total);
      expect(stats.last24h).toBeLessThanOrEqual(stats.confirmed);
    });
  });

  describe("events.confirm", () => {
    it("should confirm an event as admin", async () => {
      if (!createdEventId) {
        console.log("Skipping confirm test - no event created");
        return;
      }

      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.confirm({ id: createdEventId });

      expect(result).toBeDefined();
      expect(result.confirmed).toBe(true);
      expect(result.confirmedBy).toBe(adminUser.id);
    });

    it("should reject non-admin users", async () => {
      if (!createdEventId) {
        console.log("Skipping confirm test - no event created");
        return;
      }

      const ctx = createContext(regularUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.events.confirm({ id: createdEventId });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("events.update", () => {
    it("should update an event as admin", async () => {
      if (!createdEventId) {
        console.log("Skipping update test - no event created");
        return;
      }

      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.update({
        id: createdEventId,
        description: "Updated description",
      });

      expect(result).toBeDefined();
      expect(result.description).toBe("Updated description");
    });

    it("should reject non-admin users", async () => {
      if (!createdEventId) {
        console.log("Skipping update test - no event created");
        return;
      }

      const ctx = createContext(regularUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.events.update({
          id: createdEventId,
          description: "Unauthorized update",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("events.delete", () => {
    it("should delete an event as admin", async () => {
      if (!createdEventId) {
        console.log("Skipping delete test - no event created");
        return;
      }

      const ctx = createContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.delete({ id: createdEventId });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should reject non-admin users", async () => {
      // Create a new event for this test
      const createCtx = createContext(adminUser);
      const createCaller = appRouter.createCaller(createCtx);

      const event = await createCaller.events.create({
        type: "terrestre",
        country: "israel",
        description: "Event to test delete rejection",
        sourceName: "BBC",
        sourceUrl: "https://bbc.com/test",
        latitude: 31.768,
        longitude: 35.214,
        locationName: "Jerusalem, Israel",
        eventDate: new Date(),
      });

      const deleteCtx = createContext(regularUser);
      const deleteCaller = appRouter.createCaller(deleteCtx);

      try {
        await deleteCaller.events.delete({ id: event.id });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("events.byDateRange", () => {
    it("should validate date range", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      try {
        await caller.events.byDateRange({
          startDate: now,
          endDate: yesterday,
          limit: 100,
          offset: 0,
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should filter events by date range", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const events = await caller.events.byDateRange({
        startDate: yesterday,
        endDate: now,
        limit: 100,
        offset: 0,
      });

      expect(Array.isArray(events)).toBe(true);
      events.forEach((event) => {
        expect(event.eventDate >= yesterday).toBe(true);
        expect(event.eventDate <= now).toBe(true);
        expect(event.confirmed).toBe(true);
      });
    });
  });
});
