import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using SQLite database");
  process.env.DATABASE_URL = "file:./dev.db";
}

const sqlite = new Database('./dev.db');
export const db = drizzle(sqlite, { schema });