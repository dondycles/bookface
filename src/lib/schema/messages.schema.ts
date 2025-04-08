import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.schema";
export const state = pgEnum("state", ["seen", "delivered"]);

export const chatRoom = pgTable("chatRoom", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  people: text("people").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chat = pgTable("chat", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  roomId: text("roomId")
    .notNull()
    .references(() => chatRoom.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  senderId: text("senderId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiverId: text("receiverId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  state: state().default("delivered"),
});
