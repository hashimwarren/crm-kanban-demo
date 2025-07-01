import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";

// Check if we're in a test environment where DATABASE_URL might not be set
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.CI;

if (!process.env.DATABASE_URL && !isTestEnv) {
  throw new Error("DATABASE_URL environment variable is required");
}

let pool: Pool | null = null;
let db: NeonDatabase<typeof schema> | null = null;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  } else if (isTestEnv) {
    console.warn("DATABASE_URL not set in test environment - database operations will be mocked");
    db = null;
  }
} catch (error) {
  if (isTestEnv) {
    console.warn("Failed to connect to database in test environment:", error);
    db = null;
  } else {
    throw error;
  }
}

export { db };
export * from "./schema";

export * from "./schema";
