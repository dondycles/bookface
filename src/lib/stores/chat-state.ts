import { create } from "zustand";
import { Post } from "../server/fn/posts";

type ChatStateStore = {
  posts: Post[] | null;
  isSelecting: boolean;
  selectPost: (post: Post) => void;
  setIsSelecting: () => void;
  reset: () => void;
};

export const useChatStateStore = create<ChatStateStore>((set) => ({
  posts: null,
  selectPost: (post) =>
    set((state) => ({
      posts: state.posts?.some((p) => p.id === post.id)
        ? [...(state.posts?.filter((p) => p.id !== post.id) || [])]
        : [...(state?.posts || []), post],
    })),
  isSelecting: false,
  setIsSelecting: () => set((state) => ({ isSelecting: !state.isSelecting })),
  reset: () => set({ posts: null, isSelecting: false }),
}));
