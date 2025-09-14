"use client";

import { ReadonlyURLSearchParams } from "next/navigation";

/**
 * merge()
 *
 * Build a new URL by starting with the current path and params,
 * then applying "overrides".
 *
 * @param path - e.g. "/tips"
 * @param currentParams - the search params from useSearchParams()
 * @param overrides - key/value overrides:
 *   - value is a string → sets/replaces that param
 *   - value is "" → deletes that param
 */
export const merge = (
  path: string,
  currentParams: ReadonlyURLSearchParams,
  overrides: Record<string, string>
): string => {
  const qs = new URLSearchParams();

  // 1. Copy existing params from currentParams
  for (const [key, value] of currentParams.entries()) {
    qs.set(key, value);
  }

  // 2. Apply overrides
  for (const [key, value] of Object.entries(overrides)) {
    if (value === "") {
      qs.delete(key); // remove param if value is empty string
    } else {
      qs.set(key, value); // set or update
    }
  }

  // 3. Return final URL
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
};

/**
 * omit()
 *
 * Build a new URL by removing one or more keys from current params.
 * This is just a shortcut for "merge" with empty values.
 *
 * @param path - e.g. "/tips"
 * @param currentParams - the search params from useSearchParams()
 * @param keys - array of param names to remove
 */
export const omit = (
  path: string,
  currentParams: ReadonlyURLSearchParams,
  keys: string[]
): string => {
  const qs = new URLSearchParams();

  // 1. Copy existing params
  for (const [key, value] of currentParams.entries()) {
    qs.set(key, value);
  }

  // 2. Delete given keys
  for (const key of keys) {
    qs.delete(key);
  }

  // 3. Return final URL
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
};
