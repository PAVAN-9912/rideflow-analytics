import { ReactNode } from "react";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

interface Props<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  onRetry: () => void;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  children: (data: T) => ReactNode;
}

/** Wraps any fetched section with a consistent loading / empty / error / content flow. */
export function DataState<T>({ loading, error, data, onRetry, isEmpty, emptyTitle, children }: Props<T>) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data || (isEmpty && isEmpty(data))) {
    return <EmptyState title={emptyTitle ?? "Nothing here yet"} hint="Data will appear once trips are imported." />;
  }
  return <>{children(data)}</>;
}
