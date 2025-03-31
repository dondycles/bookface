import { useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";

export default function useAutoLoadNextPage({
  fetchNextPage,
}: {
  fetchNextPage: () => void;
}) {
  const loaderRef = useRef<HTMLButtonElement>(null);
  const { ref, entry } = useIntersection({
    root: null,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry]);

  useEffect(() => {
    if (loaderRef.current) {
      ref(loaderRef.current);
    }
  }, [ref]);

  return {
    ref,
    loaderRef,
  };
}
