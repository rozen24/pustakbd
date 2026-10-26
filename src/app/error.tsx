"use client";

import { useEffect } from "react";
import { Button } from "./components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Something went wrong</p>
      <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">We couldn&apos;t load this page</h1>
      <p className="mt-2 text-sm text-muted-foreground">Try again. If it keeps happening, come back shortly.</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
