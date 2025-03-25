import { queryOptions } from "@tanstack/react-query";
import { getPost, getPosts } from "../server/fn/posts";

export const postsQueryOptions = () =>
  queryOptions({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
    staleTime: 0,
  });
export const postQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["post", id],
    queryFn: () => getPost({ data: id }),
    staleTime: 0,
  });
