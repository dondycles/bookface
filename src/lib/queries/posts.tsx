import { queryOptions } from "@tanstack/react-query";
import { getPost, getPosts } from "../server/fn/posts";

export const postsQueryOptions = () =>
  queryOptions({
    queryKey: ["posts"],
    queryFn: ({ signal }) => getPosts({ signal }),
  });

export const postQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["post", id],
    queryFn: ({ signal }) => getPost({ data: id, signal }),
  });
