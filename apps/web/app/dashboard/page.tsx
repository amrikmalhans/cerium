"use client";

import { useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layout";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Dashboard, {session?.user.name || session?.user.email}</h1>
        </div>
      </main>
    </DashboardLayout>
  );
}
