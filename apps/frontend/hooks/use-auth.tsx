"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const session = useSession();
  const router = useRouter();

  // Debug logging for session hook behavior
  useEffect(() => {
    console.log("useAuth hook state:", {
      isPending: session.isPending,
      hasData: !!session.data,
      hasError: !!session.error,
      userId: session.data?.user?.id || 'none',
      timestamp: new Date().toISOString()
    });
  }, [session.isPending, session.data, session.error]);

  return {
    session: session.data,
    user: session.data?.user,
    isLoading: session.isPending,
    error: session.error,
  };
}

export function useRequireAuth() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
    }
  }, [session, isLoading, router]);

  return { session, isLoading };
}