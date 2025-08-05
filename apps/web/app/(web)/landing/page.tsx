import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Palette, Globe, Shield, Zap, Code, Database, Smartphone } from 'lucide-react'
import { getGithubUrl } from '@boilerplate/config/project.config'

export default function LandingPage() {
  const githubUrl = getGithubUrl()
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative landing-section overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-gradient-to-r from-primary/2 to-transparent blur-3xl" />
        </div>
        
        <div className="landing-container relative">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Next.js 15 • TypeScript • Tailwind CSS
              </span>
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Modern Web Application{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Boilerplate
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            A production-ready Next.js boilerplate with authentication, theming, internationalization, and modern development tools.{" "}
            <span className="text-foreground font-medium">Build faster, deploy easier.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="text-base px-8 py-6 h-auto">
              <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Code className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="text-base px-8 py-6 h-auto">
              <Link href="/login">
                <Shield className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border backdrop-blur-sm">
              <div className="rounded-full bg-green-500/10 p-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">Single Domain</h3>
              <p className="text-xs text-muted-foreground text-center">No CORS issues</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border backdrop-blur-sm">
              <div className="rounded-full bg-blue-500/10 p-3 mb-3">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">Better Auth</h3>
              <p className="text-xs text-muted-foreground text-center">Secure by default</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border backdrop-blur-sm">
              <div className="rounded-full bg-purple-500/10 p-3 mb-3">
                <Palette className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">8 Color Themes</h3>
              <p className="text-xs text-muted-foreground text-center">Dark mode ready</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border backdrop-blur-sm">
              <div className="rounded-full bg-teal-500/10 p-3 mb-3">
                <Globe className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">i18n Ready</h3>
              <p className="text-xs text-muted-foreground text-center">Multi-language</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section-muted">
        <div className="landing-container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to build modern apps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pre-configured with the best tools and practices. Just clone, customize, and deploy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Lightning Fast</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built with Next.js 15, React 19, and optimized for performance with modern build tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Secure Authentication</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Better Auth integration with session management, OAuth providers, and security best practices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Beautiful Themes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  8 carefully crafted color themes with dark mode support and customizable design tokens.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Database Ready</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Prisma ORM with PostgreSQL, migrations, and type-safe database operations out of the box.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">Developer Experience</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  TypeScript, ESLint, Prettier, and modern tooling configured for the best development experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-pink-500" />
                  <CardTitle className="text-lg">Mobile First</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Responsive design, PWA support, and mobile-optimized components using shadcn/ui.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Built with modern technologies
            </h2>
            <p className="text-lg text-muted-foreground">
              Carefully selected tools and frameworks for optimal developer experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { name: 'Next.js 15', category: 'Framework' },
              { name: 'React 19', category: 'Library' }, 
              { name: 'TypeScript', category: 'Language' },
              { name: 'Tailwind CSS', category: 'Styling' },
              { name: 'Better Auth', category: 'Authentication' },
              { name: 'Prisma ORM', category: 'Database' },
              { name: 'PostgreSQL', category: 'Database' },
              { name: 'Vercel', category: 'Deployment' }
            ].map((tech) => (
              <div key={tech.name} className="group relative">
                <div className="rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20">
                  <div className="text-center">
                    <h3 className="font-semibold text-card-foreground mb-1">{tech.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{tech.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8">
            <div className="relative z-10">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Ready to get started?
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Clone the repository and start building your next project with this production-ready boilerplate.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-base px-8">
                    <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                      Start Building Now
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base px-8">
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}