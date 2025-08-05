"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useSession } from "../lib/auth-client";
import { 
  getEnvironmentType, 
  getCurrentEnvironmentUrls, 
  getProjectName,
  getDisplayName,
  getVersion,
  getWebUrl 
} from "@boilerplate/config/project.config";

interface ApiHealthStatus {
  status: 'ok' | 'error' | 'loading';
  message?: string;
  timestamp?: string;
  error?: string;
}

interface CookieInfo {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  expires?: string;
}

export default function DebugPage() {
  const { data: session, isPending: isLoading } = useSession();
  const [apiHealth, setApiHealth] = useState<ApiHealthStatus>({ status: 'loading' });
  const [cookies, setCookies] = useState<CookieInfo[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const environment = getEnvironmentType();
  const environmentUrls = getCurrentEnvironmentUrls();

  useEffect(() => {
    // Check API health
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (response.ok) {
          setApiHealth({
            status: 'ok',
            message: data.message || 'API is healthy',
            timestamp: data.timestamp || new Date().toISOString()
          });
        } else {
          setApiHealth({
            status: 'error',
            error: data.error || 'API health check failed'
          });
        }
      } catch (error) {
        setApiHealth({
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to reach API'
        });
      }
    };

    // Parse cookies
    const parseCookies = () => {
      const cookieString = document.cookie;
      const cookieList: CookieInfo[] = [];
      
      if (cookieString) {
        const cookies = cookieString.split(';');
        cookies.forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) {
            cookieList.push({
              name: decodeURIComponent(name),
              value: decodeURIComponent(value)
            });
          }
        });
      }
      
      setCookies(cookieList);
    };

    checkApiHealth();
    parseCookies();
  }, []);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getEnvironmentBadgeColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-green-500 text-white';
      case 'staging': return 'bg-yellow-500 text-white';
      case 'develop': return 'bg-blue-500 text-white';
      case 'development': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'loading': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debug Information</h1>
          <p className="text-muted-foreground">
            Diagnostic information for troubleshooting and development
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Environment Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CardTitle>Environment Information</CardTitle>
            <Badge className={getEnvironmentBadgeColor(environment)}>
              {environment.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Project</div>
              <div className="font-mono">{getDisplayName()} v{getVersion()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Environment</div>
              <div className="font-mono">{environment}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Web URL</div>
              <div className="font-mono break-all">{environmentUrls.web}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Current URL</div>
              <div className="font-mono break-all">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">User Agent</div>
              <div className="font-mono text-xs break-all">{typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
              <div className="font-mono">{new Date().toISOString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Health */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CardTitle>API Health Status</CardTitle>
            <Badge className={getStatusBadgeColor(apiHealth.status)}>
              {apiHealth.status.toUpperCase()}
            </Badge>
          </div>
          <div className="space-y-2">
            {apiHealth.status === 'ok' && (
              <>
                <div className="text-green-600">✓ {apiHealth.message}</div>
                {apiHealth.timestamp && (
                  <div className="text-sm text-muted-foreground">
                    Last checked: {new Date(apiHealth.timestamp).toLocaleString()}
                  </div>
                )}
              </>
            )}
            {apiHealth.status === 'error' && (
              <div className="text-red-600">✗ {apiHealth.error}</div>
            )}
            {apiHealth.status === 'loading' && (
              <div className="text-gray-600">⏳ Checking API health...</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">Authentication Status</CardTitle>
          {isLoading ? (
            <div className="text-gray-600">⏳ Loading authentication state...</div>
          ) : session?.user ? (
            <div className="space-y-3">
              <div className="text-green-600">✓ User is authenticated</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">User ID</div>
                  <div className="font-mono">{session.user.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="font-mono">{session.user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div className="font-mono">{session.user.name || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email Verified</div>
                  <div className="font-mono">{session.user.emailVerified ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Created At</div>
                  <div className="font-mono">{session.user.createdAt ? new Date(session.user.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Updated At</div>
                  <div className="font-mono">{session.user.updatedAt ? new Date(session.user.updatedAt).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-600">✗ User is not authenticated</div>
          )}
        </CardContent>
      </Card>

      {/* Session & Cookies */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">Session & Cookies</CardTitle>
          <div className="space-y-4">
            {/* Session Information */}
            {session && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Session Data</div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2"
                    onClick={() => copyToClipboard(JSON.stringify(session, null, 2), 'session')}
                  >
                    {copied === 'session' ? '✓ Copied' : 'Copy Session'}
                  </Button>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Cookie List */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Browser Cookies ({cookies.length})
              </div>
              {cookies.length > 0 ? (
                <div className="space-y-2">
                  {cookies.map((cookie, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-mono text-sm font-medium">{cookie.name}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${cookie.name}=${cookie.value}`, `cookie-${index}`)}
                        >
                          {copied === `cookie-${index}` ? '✓ Copied' : 'Copy'}
                        </Button>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground break-all">
                        {cookie.value.length > 100 ? `${cookie.value.substring(0, 100)}...` : cookie.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No cookies found</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables (Non-Sensitive) */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">Environment Configuration</CardTitle>
          <CardDescription className="mb-4">
            Non-sensitive configuration values detected from the environment
          </CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">NODE_ENV</div>
              <div className="font-mono">{typeof window !== 'undefined' ? 'client' : process.env.NODE_ENV || 'Not set'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">VERCEL_ENV</div>
              <div className="font-mono">{typeof window !== 'undefined' ? 'client' : process.env.VERCEL_ENV || 'Not set'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">VERCEL_GIT_COMMIT_REF</div>
              <div className="font-mono">{typeof window !== 'undefined' ? 'client' : process.env.VERCEL_GIT_COMMIT_REF || 'Not set'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">VERCEL_URL</div>
              <div className="font-mono break-all">{typeof window !== 'undefined' ? 'client' : process.env.VERCEL_URL || 'Not set'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">Quick Actions</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('/api/health', '_blank')}
            >
              Test API Health
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/api/auth/session', '_blank')}
            >
              View Raw Session
            </Button>
            {session?.user && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/login'}
              >
                Sign Out & Test Login
              </Button>
            )}
            {!session?.user && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/login'}
              >
                Test Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Guide */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">Common Issues & Solutions</CardTitle>
          <div className="space-y-4">
            <div>
              <div className="font-medium">🔒 Authentication not working</div>
              <div className="text-sm text-muted-foreground ml-6">
                • Check if <code>better-auth.session_token</code> cookie exists<br/>
                • Verify BETTER_AUTH_SECRET is set in environment variables<br/>
                • Ensure database connection is working (check API health)
              </div>
            </div>
            <div>
              <div className="font-medium">🌐 Environment detection issues</div>
              <div className="text-sm text-muted-foreground ml-6">
                • Check VERCEL_ENV and VERCEL_GIT_COMMIT_REF values<br/>
                • Verify project.config.ts environment detection logic<br/>
                • Ensure URLs match expected patterns
              </div>
            </div>
            <div>
              <div className="font-medium">🗄️ Database connection issues</div>
              <div className="text-sm text-muted-foreground ml-6">
                • Verify DATABASE_URL environment variable<br/>
                • Check if migrations have been run<br/>
                • Test database connectivity outside the app
              </div>
            </div>
            <div>
              <div className="font-medium">🍪 Cookie problems</div>
              <div className="text-sm text-muted-foreground ml-6">
                • Ensure secure cookies for HTTPS environments<br/>
                • Check sameSite settings for cross-site requests<br/>
                • Verify domain settings for subdomains
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}