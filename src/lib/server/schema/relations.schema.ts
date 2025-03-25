import { relations } from "drizzle-orm";
import { user } from "./auth.schema";
import { post } from "./post.schema";

export const postsRelations = relations(post, ({ one }) => ({
  author: one(user, { fields: [post.userId], references: [user.id] }),
}));

export const usersRelations = relations(user, ({ many }) => ({
  posts: many(post),
}));
