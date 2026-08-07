"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  findOptionById,
  getSearchParams,
  parsePageParam,
  setSearchParams,
  subscribeToSearchParams,
} from "@/lib/urlQueryState";

/**
 * Sync a small set of list filters with the URL query string.
 *
 * schema keys:
 *  - type: "string" | "page" | "option"
 *  - param: query key (defaults to field name)
 *  - defaultValue: omitted from URL when equal (page defaults to 1)
 *  - options: for type "option", array of { id, label }
 *  - resetPageOnChange: when true (default for non-page fields), set pageKey to 1
 *
 * @param {Record<string, object>} schema
 * @param {{ pageKey?: string, pathname?: string }} [config]
 */
export default function useUrlQueryState(schema, config = {}) {
  const pageKey = config.pageKey ?? "page";
  const pathname = config.pathname;
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const readFromParams = useCallback((params) => {
    const next = {};
    for (const [key, field] of Object.entries(schemaRef.current)) {
      const param = field.param ?? key;
      const raw = params.get(param);
      if (field.type === "page") {
        next[key] = parsePageParam(raw, field.defaultValue ?? 1);
      } else if (field.type === "option") {
        next[key] = findOptionById(field.options ?? [], raw);
      } else {
        next[key] = raw ?? field.defaultValue ?? "";
      }
    }
    return next;
  }, []);

  const [state, setState] = useState(() => readFromParams(getSearchParams()));

  // Sync from the real URL after mount (SSR / first paint may not have window).
  useEffect(() => {
    setState(readFromParams(getSearchParams()));
  }, [readFromParams]);

  useEffect(() => {
    return subscribeToSearchParams((params) => {
      setState(readFromParams(params));
    });
  }, [readFromParams]);

  const patchUrl = useCallback(
    (partial) => {
      const patch = {};
      for (const [key, value] of Object.entries(partial)) {
        const field = schemaRef.current[key];
        if (!field) continue;
        const param = field.param ?? key;
        if (field.type === "page") {
          const page = parsePageParam(value, field.defaultValue ?? 1);
          patch[param] = page <= 1 ? null : page;
        } else if (field.type === "option") {
          patch[param] = value?.id ?? null;
        } else {
          const trimmed =
            typeof value === "string" ? value.trim() : (value ?? "");
          const def = field.defaultValue ?? "";
          patch[param] = trimmed === def || trimmed === "" ? null : trimmed;
        }
      }
      setSearchParams(patch, { pathname });
    },
    [pathname],
  );

  const setField = useCallback(
    (key, value, { resetPage = true } = {}) => {
      const field = schemaRef.current[key];
      if (!field) return;

      const shouldResetPage =
        resetPage &&
        key !== pageKey &&
        field.resetPageOnChange !== false &&
        schemaRef.current[pageKey]?.type === "page";

      const partial = { [key]: value };
      if (shouldResetPage) {
        partial[pageKey] = 1;
      }

      setState((prev) => {
        const next = { ...prev, ...partial };
        if (field.type === "option") {
          next[key] = value ?? null;
        } else if (field.type === "page") {
          next[key] = parsePageParam(value, field.defaultValue ?? 1);
        } else {
          next[key] =
            typeof value === "string" ? value : (value ?? field.defaultValue ?? "");
        }
        if (shouldResetPage) {
          next[pageKey] = 1;
        }
        return next;
      });
      patchUrl(partial);
    },
    [pageKey, patchUrl],
  );

  const setFields = useCallback(
    (partial, { resetPage = false } = {}) => {
      const nextPartial = { ...partial };
      if (resetPage && schemaRef.current[pageKey]?.type === "page") {
        nextPartial[pageKey] = 1;
      }

      setState((prev) => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(nextPartial)) {
          const field = schemaRef.current[key];
          if (!field) continue;
          if (field.type === "option") {
            next[key] = value ?? null;
          } else if (field.type === "page") {
            next[key] = parsePageParam(value, field.defaultValue ?? 1);
          } else {
            next[key] =
              typeof value === "string"
                ? value
                : (value ?? field.defaultValue ?? "");
          }
        }
        return next;
      });
      patchUrl(nextPartial);
    },
    [pageKey, patchUrl],
  );

  return useMemo(
    () => ({
      ...state,
      setField,
      setFields,
      patchUrl,
    }),
    [state, setField, setFields, patchUrl],
  );
}
