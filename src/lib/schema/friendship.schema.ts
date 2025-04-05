import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.schema";
export const status = pgEnum("status", ["accepted", "pending"]);

export const friendship = pgTable("friendship", {
  id: text("id").primaryKey(),
  requester: text("requester")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiver: text("receiver")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: status().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acceptedAt: timestamp("updated_at"),
});
