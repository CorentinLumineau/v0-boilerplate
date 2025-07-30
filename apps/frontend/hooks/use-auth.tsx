"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const session = useSession();
  const router = useRouter();

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