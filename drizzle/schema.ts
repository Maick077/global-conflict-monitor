import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  /** Type of event: aéreo (aerial), terrestre (ground), marítimo (maritime) */
  type: mysqlEnum("type", ["aéreo", "terrestre", "marítimo"]).notNull(),
  /** Country of origin: iran or israel */
  country: mysqlEnum("country", ["iran", "israel"]).notNull(),
  /** Event description */
  description: text("description").notNull(),
  /** Source name (e.g., Reuters, BBC, etc.) */
  sourceName: varchar("sourceName", { length: 255 }).notNull(),
  /** Source URL for verification */
  sourceUrl: varchar("sourceUrl", { length: 512 }).notNull(),
  /** Latitude coordinate */
  latitude: varchar("latitude", { length: 20 }).notNull(),
  /** Longitude coordinate */
  longitude: varchar("longitude", { length: 20 }).notNull(),
  /** Location name/description */
  locationName: varchar("locationName", { length: 255 }).notNull(),
  /** Whether event is confirmed by admin */
  confirmed: boolean("confirmed").default(false).notNull(),
  /** Event occurrence timestamp */
  eventDate: timestamp("eventDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  /** Admin who confirmed the event */
  confirmedBy: int("confirmedBy"),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;