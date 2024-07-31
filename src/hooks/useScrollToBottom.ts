import { useEffect, useRef } from "react";

export const useScrollToBottom = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });

  return ref;
};