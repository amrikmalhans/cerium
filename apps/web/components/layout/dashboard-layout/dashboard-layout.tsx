"use client";

import { DashboardHeader } from "./dashboard-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ 
  children, 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
      />
      {children}
    </div>
  );
}
