import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, events, Event, InsertEvent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Event queries
export async function createEvent(event: InsertEvent): Promise<Event> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(events).values(event);
  const inserted = await db.select().from(events).where(eq(events.id, Number(result[0].insertId))).limit(1);
  
  if (!inserted[0]) throw new Error("Failed to create event");
  return inserted[0];
}

export async function getEventById(id: number): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function getConfirmedEvents(limit: number = 100, offset: number = 0): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(events)
    .where(eq(events.confirmed, true))
    .orderBy(desc(events.eventDate))
    .limit(limit)
    .offset(offset);
}

export async function getEventsByCountry(country: "iran" | "israel", limit: number = 100, offset: number = 0): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(events)
    .where(and(eq(events.country, country), eq(events.confirmed, true)))
    .orderBy(desc(events.eventDate))
    .limit(limit)
    .offset(offset);
}

export async function getEventsByType(type: "aéreo" | "terrestre" | "marítimo", limit: number = 100, offset: number = 0): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(events)
    .where(and(eq(events.type, type), eq(events.confirmed, true)))
    .orderBy(desc(events.eventDate))
    .limit(limit)
    .offset(offset);
}

export async function getEventsByDateRange(startDate: Date, endDate: Date, limit: number = 100, offset: number = 0): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(events)
    .where(and(
      gte(events.eventDate, startDate),
      lte(events.eventDate, endDate),
      eq(events.confirmed, true)
    ))
    .orderBy(desc(events.eventDate))
    .limit(limit)
    .offset(offset);
}

export async function updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(events).set({ ...updates, updatedAt: new Date() }).where(eq(events.id, id));
  return getEventById(id);
}

export async function deleteEvent(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    await db.delete(events).where(eq(events.id, id));
    return true;
  } catch (error) {
    console.error("Failed to delete event:", error);
    return false;
  }
}

export async function confirmEvent(id: number, adminId: number): Promise<Event | undefined> {
  return updateEvent(id, { confirmed: true, confirmedBy: adminId });
}

export async function getEventStats(): Promise<{
  total: number;
  confirmed: number;
  byType: Record<string, number>;
  byCountry: Record<string, number>;
  last24h: number;
}> {
  const db = await getDb();
  if (!db) return { total: 0, confirmed: 0, byType: {}, byCountry: {}, last24h: 0 };
  
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const allEvents = await db.select().from(events);
  const confirmedEvents = allEvents.filter(e => e.confirmed);
  const last24hEvents = confirmedEvents.filter(e => e.eventDate >= last24h);
  
  const byType: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  
  confirmedEvents.forEach(event => {
    byType[event.type] = (byType[event.type] || 0) + 1;
    byCountry[event.country] = (byCountry[event.country] || 0) + 1;
  });
  
  return {
    total: allEvents.length,
    confirmed: confirmedEvents.length,
    byType,
    byCountry,
    last24h: last24hEvents.length,
  };
}
