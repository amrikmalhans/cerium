"use client";

import { PageHeader } from "./page-header";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader />
      {children}
    </div>
  );
}
