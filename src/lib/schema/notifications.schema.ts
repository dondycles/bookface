import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { friendship } from "./friendship.schema";
import { post, postComments, postLikes } from "./post.schema";
import { user } from "./user.schema";
export const type = pgEnum("type", [
  "addfriendship",
  "acceptedfriendship",
  "like",
  "comment",
]);

export const notification = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  type: type().notNull(),
  receiverId: text("receiverId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  notifierId: text("notifierId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  postId: text("postId").references(() => post.id, { onDelete: "cascade" }),
  friendshipId: text("friendshipId").references(() => friendship.id, {
    onDelete: "cascade",
  }),
  likeId: text("likeId").references(() => postLikes.id, {
    onDelete: "cascade",
  }),
  commentId: text("commentId").references(() => postComments.id, {
    onDelete: "cascade",
  }),
  isRead: boolean("isRead").default(false),
});
