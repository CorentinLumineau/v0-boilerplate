import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-6">
          <WifiOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">You're offline</h1>
          <p className="text-muted-foreground">
            It looks like you've lost your internet connection. Check your connection and try again.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            Go Back
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Some features may still be available while offline.</p>
        </div>
      </div>
    </div>
  )
}