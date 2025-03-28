import { queryOptions } from "@tanstack/react-query";
import { getSearchResult } from "../server/fn/search";

export const searchResultsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["searchResults", q],
    queryFn: ({ signal }) => getSearchResult({ data: q, signal }),
  });
