/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

export type EventStats = {
  total: number;
  confirmed: number;
  byType: Record<string, number>;
  byCountry: Record<string, number>;
  last24h: number;
};
