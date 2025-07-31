"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const publicRoutes = ["/login", "/signup", "/debug", "/debug-auth", "/session-test", "/debug-simple"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  const isPublicRoute = publicRoutes.includes(pathname);
  const isDebugRoute = pathname.startsWith("/debug") || pathname === "/session-test";

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Ensure we're on the client side before doing anything
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Client-side only debug logging
  useEffect(() => {
    if (isClient) {
      console.log("=== AuthGuard DEBUG ===");
      console.log("pathname:", pathname);
      console.log("isPublicRoute:", isPublicRoute);
      console.log("isLoading:", isLoading);
      console.log("session:", session);
      console.log("cookies present:", typeof document !== 'undefined' && document.cookie.includes('better-auth'));
      console.log("=======================");
    }
  }, [isClient, pathname, isPublicRoute, isLoading, session]);

  // Redirect logic
  useEffect(() => {
    if (isClient && !isLoading) {
      if (!session && !isPublicRoute) {
        console.log("No session found, redirecting to login");
        const timer = setTimeout(() => {
          router.push("/login");
        }, 100);
        return () => clearTimeout(timer);
      } else if (session && isPublicRoute && !pathname.startsWith("/debug")) {
        console.log("Session found on public route, redirecting to home");
        router.push("/");
      }
    }
  }, [isClient, session, isLoading, isPublicRoute, router, pathname]);

  // NOW WE CAN SAFELY RETURN CONDITIONALLY
  
  // TEMPORARY: Allow access to debug routes without authentication
  if (isDebugRoute) {
    return <>{children}</>;
  }

  // Don't render anything until we're on the client
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // For public routes (login/signup), render them without the main layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, only show content if authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}