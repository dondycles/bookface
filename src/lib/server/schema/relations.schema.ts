import { relations } from "drizzle-orm";
import { user, username } from "./auth.schema";
import { post } from "./post.schema";

export const postsRelations = relations(post, ({ one }) => ({
  author: one(user, { fields: [post.userId], references: [user.id] }),
}));

export const usersRelations = relations(user, ({ many, one }) => ({
  posts: many(post),
  username: one(username, { fields: [user.id], references: [username.userId] }),
}));

export const usernamesRelations = relations(username, ({ one }) => ({
  user: one(user, { fields: [username.id], references: [user.id] }),
}));
