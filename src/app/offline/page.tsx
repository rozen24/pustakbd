import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Connection required</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">You are offline</h1>
      <p className="mt-3 text-sm text-muted-foreground">Some features may not be available until your connection is restored.</p>
      <Link href="/" className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</Link>
    </main>
  );
}
