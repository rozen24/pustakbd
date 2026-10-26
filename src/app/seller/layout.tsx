"use client";

import { SellerLayout } from "../components/layout/dashboards";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SellerLayout>{children}</SellerLayout>;
}
