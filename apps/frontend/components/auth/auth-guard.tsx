"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingToken, setCheckingToken] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasToken = urlParams.has('access_token');
    if (hasToken) {
      setCheckingToken(true);
      setTimeout(() => setCheckingToken(false), 1500);
    }
  }, []);

  useEffect(() => {
    if (!loading && !checkingToken && !user) {
      window.location.href = `${WEB_URL}/auth/sign-in`;
    }
  }, [user, loading, checkingToken]);

  if (loading || checkingToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

