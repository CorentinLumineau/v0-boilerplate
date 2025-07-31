"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const publicRoutes = ["/login", "/signup", "/debug", "/debug-auth"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Debug session state for cross-domain troubleshooting
    console.log("AuthGuard state:", { 
      session: session ? { userId: session.user?.id, email: session.user?.email } : null,
      isLoading, 
      pathname, 
      isPublicRoute,
      cookies: document.cookie.includes('better-auth') ? 'present' : 'missing'
    });
    
    if (!isLoading) {
      if (!session && !isPublicRoute) {
        console.log("No session found, redirecting to login");
        // Add a small delay to prevent immediate redirect loops
        const timer = setTimeout(() => {
          router.push("/login");
        }, 100);
        return () => clearTimeout(timer);
      } else if (session && isPublicRoute && pathname !== "/debug") {
        console.log("Session found on public route, redirecting to home");
        router.push("/");
      }
    }
  }, [session, isLoading, isPublicRoute, router, pathname]);

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