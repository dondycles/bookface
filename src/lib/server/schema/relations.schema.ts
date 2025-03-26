import { relations } from "drizzle-orm";
import { user, username } from "./auth.schema";
import { post, postLikes } from "./post.schema";

export const postsRelations = relations(post, ({ one, many }) => ({
  author: one(user, { fields: [post.userId], references: [user.id] }),
  likers: many(postLikes),
}));

export const usersRelations = relations(user, ({ many, one }) => ({
  posts: many(post),
  username: one(username, { fields: [user.id], references: [username.userId] }),
  likedPosts: many(postLikes),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  likerData: one(user, { fields: [postLikes.likerId], references: [user.id] }),
  post: one(post, { fields: [postLikes.postId], references: [post.id] }),
}));

export const usernamesRelations = relations(username, ({ one }) => ({
  user: one(user, { fields: [username.id], references: [user.id] }),
}));
