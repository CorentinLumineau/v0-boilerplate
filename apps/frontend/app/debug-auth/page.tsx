"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function DebugAuthPage() {
  const session = useSession();
  const [refreshCount, setRefreshCount] = useState(0);

  const forceRefresh = () => {
    window.location.reload();
  };

  const checkCookies = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name.includes('better-auth')) {
        acc[name] = value ? value.substring(0, 50) + '...' : 'empty';
      }
      return acc;
    }, {} as Record<string, string>);
    return cookies;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Session Status:</strong>
            <pre className="bg-muted p-3 rounded mt-2 text-sm">
              {JSON.stringify({
                isPending: session.isPending,
                isLoading: session.isPending,
                hasData: !!session.data,
                user: session.data?.user ? {
                  id: session.data.user.id,
                  email: session.data.user.email,
                  name: session.data.user.name
                } : null,
                error: session.error
              }, null, 2)}
            </pre>
          </div>

          <div>
            <strong>Browser Cookies:</strong>
            <pre className="bg-muted p-3 rounded mt-2 text-sm">
              {JSON.stringify(checkCookies(), null, 2)}
            </pre>
          </div>

          <div>
            <strong>Environment:</strong>
            <pre className="bg-muted p-3 rounded mt-2 text-sm">
              {JSON.stringify({
                origin: typeof window !== 'undefined' ? window.location.origin : 'server',
                apiUrl: process.env.NEXT_PUBLIC_API_URL,
                nodeEnv: process.env.NODE_ENV
              }, null, 2)}
            </pre>
          </div>

          <div className="space-x-2">
            <Button onClick={forceRefresh}>
              Force Page Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setRefreshCount(c => c + 1)}
            >
              Re-render ({refreshCount})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}