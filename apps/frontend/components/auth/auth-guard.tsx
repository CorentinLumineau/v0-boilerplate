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
  const [hasRedirected, setHasRedirected] = useState(false);
  
  const isPublicRoute = publicRoutes.includes(pathname);
  const isDebugRoute = pathname.startsWith("/debug") || pathname === "/session-test";

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Ensure we're on the client side before doing anything
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add MINIMUM wait time for session loading - don't rush the redirect
  useEffect(() => {
    if (isClient) {
      // Always wait at least 500ms before allowing any redirects
      const minWaitTimeout = setTimeout(() => {
        console.log("Minimum wait time completed, checking session state");
        setSessionCheckTimeout(true);
      }, 500); // Wait 500ms minimum

      return () => clearTimeout(minWaitTimeout);
    }
  }, [isClient]);

  // Additional timeout if still loading after minimum wait
  useEffect(() => {
    if (isClient && isLoading && sessionCheckTimeout) {
      const timeout = setTimeout(() => {
        console.log("Extended session loading timeout - proceeding with current state");
        // sessionCheckTimeout is already true, so this just logs
      }, 2000); // Additional 2 seconds if still loading

      return () => clearTimeout(timeout);
    }
  }, [isClient, isLoading, sessionCheckTimeout]);

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

  // Redirect logic - waits for minimum time AND session loading to complete
  useEffect(() => {
    // Only proceed if we've waited the minimum time AND session is not loading
    const canProceed = sessionCheckTimeout && !isLoading;
    
    if (isClient && canProceed && !hasRedirected) {
      if (!session && !isPublicRoute) {
        console.log("REDIRECT DECISION: No session found after proper wait, redirecting to login");
        console.log("Final state - isLoading:", isLoading, "sessionCheckTimeout:", sessionCheckTimeout, "session:", !!session);
        setHasRedirected(true);
        router.push("/login");
      } else if (session && pathname === "/login") {
        // Only redirect from login page if we have a valid session
        console.log("REDIRECT DECISION: Session found on login page, redirecting to home");
        setHasRedirected(true);
        // Use window.location.href for cross-domain redirect to ensure cookies are properly handled
        if (typeof window !== 'undefined') {
          window.location.href = "/";
        } else {
          router.replace("/");
        }
      } else if (session && !isPublicRoute) {
        console.log("SUCCESS: Session found on protected route, allowing access");
      }
    }
  }, [isClient, session, isLoading, sessionCheckTimeout, isPublicRoute, router, pathname, hasRedirected]);

  // Reset redirect flag when pathname changes
  useEffect(() => {
    setHasRedirected(false);
  }, [pathname]);

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