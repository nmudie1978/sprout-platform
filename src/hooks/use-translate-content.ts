"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

interface TranslateOptions {
  targetLocale: string;
  contentType?: string;
}

interface BatchItem {
  key: string;
  text: string;
}

export function useTranslateContent() {
  const queryClient = useQueryClient();
  const cacheRef = useRef<Map<string, string>>(new Map());

  const mutation = useMutation({
    mutationFn: async ({
      items,
      targetLocale,
      contentType,
    }: {
      items: BatchItem[];
      targetLocale: string;
      contentType?: string;
    }) => {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, targetLocale, contentType }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();
      return data.translations as Record<string, string>;
    },
    onSuccess: (data) => {
      // Store in local cache
      for (const [key, value] of Object.entries(data)) {
        cacheRef.current.set(key, value);
      }
    },
  });

  const translate = useCallback(
    async (items: BatchItem[], options: TranslateOptions) => {
      // Check local cache for already-translated items
      const uncached = items.filter((i) => !cacheRef.current.has(i.key));
      if (uncached.length === 0) {
        return Object.fromEntries(
          items.map((i) => [i.key, cacheRef.current.get(i.key)!])
        );
      }

      const result = await mutation.mutateAsync({
        items: uncached,
        targetLocale: options.targetLocale,
        contentType: options.contentType,
      });

      // Merge with cached items
      const merged: Record<string, string> = {};
      for (const item of items) {
        merged[item.key] = cacheRef.current.get(item.key) ?? result[item.key] ?? item.text;
      }
      return merged;
    },
    [mutation]
  );

  const getTranslation = useCallback(
    (key: string) => cacheRef.current.get(key),
    []
  );

  return {
    translate,
    isTranslating: mutation.isPending,
    getTranslation,
  };
}
