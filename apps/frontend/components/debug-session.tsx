"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getBackendUrl } from "@boilerplate/config/project.config";

export function DebugSession() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  
  const checkSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check backend session endpoint
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/session-debug`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      // Get browser cookies (client-side only)
      const browserCookies = typeof document !== 'undefined' ? 
        document.cookie.split(';').map(c => {
          const [name, value] = c.trim().split('=');
          return { name, value: value ? value.substring(0, 20) + '...' : '' };
        }) : [{ name: 'server-side', value: 'cookies not available during SSR' }];
      
      setDebugInfo({
        ...data,
        browserCookies,
        frontendSession: session.data,
        environment: {
          frontend: typeof window !== 'undefined' ? window.location.origin : 'server-side',
          backend: backendUrl,
          isProduction: process.env.NODE_ENV === 'production',
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debug info');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkSession();
  }, []);
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Session Debug Information</CardTitle>
        <CardDescription>
          Debugging cookie authentication issues between frontend and backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${session.data ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              Frontend Session: {session.data ? 'Active' : 'Not Found'}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkSession}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {debugInfo && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Environment</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(debugInfo.environment, null, 2)}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Backend Session</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(debugInfo.session, null, 2)}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Browser Cookies</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(debugInfo.browserCookies, null, 2)}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Backend Cookies Received</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(debugInfo.cookies, null, 2)}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Request Headers</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(debugInfo.headers, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}