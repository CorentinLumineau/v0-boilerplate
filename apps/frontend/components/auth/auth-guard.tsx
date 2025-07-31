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
  const [sessionCheckTimeout, setSessionCheckTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const isPublicRoute = publicRoutes.includes(pathname);
  const isDebugRoute = pathname.startsWith("/debug") || pathname === "/session-test";

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Ensure we're on the client side before doing anything
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add timeout for session loading - wait 3 seconds before giving up
  useEffect(() => {
    if (isClient && isLoading) {
      const timeout = setTimeout(() => {
        console.log("Session loading timeout - proceeding with current state");
        setSessionCheckTimeout(true);
      }, 3000); // Wait 3 seconds for session to load

      return () => clearTimeout(timeout);
    } else if (!isLoading) {
      setSessionCheckTimeout(false);
    }
  }, [isClient, isLoading]);

  // Retry mechanism for failed session loads
  useEffect(() => {
    if (isClient && !isLoading && !session && sessionCheckTimeout && retryCount < 2) {
      console.log(`Session load failed, retrying... (attempt ${retryCount + 1}/2)`);
      setRetryCount(prev => prev + 1);
      setSessionCheckTimeout(false);
      
      // Force a page reload as a last resort
      if (retryCount === 1) {
        console.log("Final retry - forcing page reload");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  }, [isClient, isLoading, session, sessionCheckTimeout, retryCount]);

  // Enhanced debug logging
  useEffect(() => {
    if (isClient) {
      console.log("=== AuthGuard DEBUG ===");
      console.log("pathname:", pathname);
      console.log("isPublicRoute:", isPublicRoute);
      console.log("isDebugRoute:", isDebugRoute);
      console.log("isLoading:", isLoading);
      console.log("sessionCheckTimeout:", sessionCheckTimeout);
      console.log("retryCount:", retryCount);
      console.log("session exists:", !!session);
      console.log("session user:", session?.user?.email || 'none');
      console.log("cookies in document:", typeof document !== 'undefined' ? document.cookie.length : 'server');
      console.log("better-auth cookies:", typeof document !== 'undefined' && document.cookie.includes('better-auth'));
      console.log("timestamp:", new Date().toISOString());
      console.log("=======================");
    }
  }, [isClient, pathname, isPublicRoute, isDebugRoute, isLoading, sessionCheckTimeout, retryCount, session]);

  // Redirect logic - now waits for session to load OR timeout
  useEffect(() => {
    const sessionFinishedLoading = !isLoading || sessionCheckTimeout;
    
    if (isClient && sessionFinishedLoading) {
      if (!session && !isPublicRoute) {
        console.log("No session found after loading/timeout, redirecting to login");
        console.log("isLoading:", isLoading, "sessionCheckTimeout:", sessionCheckTimeout);
        const timer = setTimeout(() => {
          router.push("/login");
        }, 500); // Increased delay to 500ms
        return () => clearTimeout(timer);
      } else if (session && isPublicRoute && !pathname.startsWith("/debug")) {
        console.log("Session found on public route, redirecting to home");
        router.push("/");
      }
    }
  }, [isClient, session, isLoading, sessionCheckTimeout, isPublicRoute, router, pathname]);

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

  // Show loading state - wait for session to load OR timeout
  if (isLoading && !sessionCheckTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
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