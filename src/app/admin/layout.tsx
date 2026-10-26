"use client";

import { AdminLayout } from "../components/layout/dashboards";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
