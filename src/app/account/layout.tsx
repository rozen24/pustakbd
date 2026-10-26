"use client";

import { AccountLayout } from "../components/layout/dashboards";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>;
}
