import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/schema";

const driver = postgres(process.env.DATABASE_URL as string, { prepare: false });
export const db = drizzle({ client: driver, schema, casing: "snake_case" });
