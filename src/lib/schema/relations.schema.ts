import { relations } from "drizzle-orm";
import { friendship } from "./friendship.schema";
import { post, postComments, postLikes } from "./post.schema";
import { user } from "./user.schema";

export const postsRelations = relations(post, ({ one, many }) => ({
  author: one(user, { fields: [post.userId], references: [user.id] }),
  likers: many(postLikes),
  comments: many(postComments),
  likes: many(postLikes),
}));

export const usersRelations = relations(user, ({ many }) => ({
  posts: many(post),
  likedPosts: many(postLikes),
  comments: many(postComments),
  friendships: many(friendship),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  likerData: one(user, { fields: [postLikes.likerId], references: [user.id] }),
  post: one(post, { fields: [postLikes.postId], references: [post.id] }),
}));

export const commentsRelations = relations(postComments, ({ one }) => ({
  commenter: one(user, { fields: [postComments.commenterId], references: [user.id] }),
  post: one(post, { fields: [postComments.postId], references: [post.id] }),
}));

export const friendshipRelations = relations(friendship, ({ one }) => ({
  receiverInfo: one(user, {
    fields: [friendship.receiver],
    references: [user.id],
  }),
  requesterInfo: one(user, {
    fields: [friendship.requester],
    references: [user.id],
  }),
}));
