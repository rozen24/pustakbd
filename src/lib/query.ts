// Thin adapter over TanStack Query. Keeps a compact `useQuery(key, fn, opts)`
// call signature across the app while delegating caching/invalidation to
// @tanstack/react-query under the hood.

import {
  QueryClient,
  useMutation as useRQMutation,
  useQuery as useRQQuery,
} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type Key = string | (string | number | undefined | null)[];
const toKey = (key: Key): unknown[] => (Array.isArray(key) ? key : [key]);

export interface QueryResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useQuery<T>(
  key: Key,
  fn: () => Promise<T>,
  options: { enabled?: boolean } = {},
): QueryResult<T> {
  const enabled = options.enabled ?? true;
  const r = useRQQuery<T>({ queryKey: toKey(key), queryFn: fn, enabled });
  return {
    data: r.data,
    loading: r.isLoading || (enabled && r.isPending && r.fetchStatus === "fetching"),
    error: (r.error as Error) ?? null,
    refetch: () => void r.refetch(),
  };
}

// Invalidate every query whose first key segment matches `base`.
export function invalidate(base: string) {
  queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === base });
}

export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: { onSuccess?: (result: TResult) => void; invalidates?: string[] } = {},
) {
  const m = useRQMutation<TResult, Error, TArgs>({
    mutationFn: (args) => fn(...args),
    onSuccess: (result) => {
      options.invalidates?.forEach(invalidate);
      options.onSuccess?.(result);
    },
  });
  return {
    mutate: (...args: TArgs) => m.mutateAsync(args),
    loading: m.isPending,
    error: (m.error as Error) ?? null,
  };
}
