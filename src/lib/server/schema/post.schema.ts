import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../schema/auth.schema";

export const post = pgTable("post", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  message: text("message").notNull(),
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
