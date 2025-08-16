'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Palette, Globe, Shield, Zap, Code, Database, Smartphone } from 'lucide-react'
import { getGithubUrl, getDisplayName } from '@boilerplate/config/project.config'
import { useLanguageSettings } from '@/hooks/use-settings-store'

export default function LandingPage() {
  const githubUrl = getGithubUrl()
  const appName = getDisplayName()
  const { t } = useLanguageSettings()
  
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
            {t("modernWebApp")}{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("boilerplate")}
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            {t("productionReadyDescription")}{" "}
            <span className="text-foreground font-medium">{t("buildFasterDeployEasier")}</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="text-base px-8 py-6 h-auto">
              <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Code className="mr-2 h-5 w-5" />
                {t("getStarted")}
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="text-base px-8 py-6 h-auto">
              <Link href="/login">
                <Shield className="mr-2 h-5 w-5" />
                {t("signIn")}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border backdrop-blur-sm">
              <div className="rounded-full bg-green-500/10 p-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">{t("singleDomain")}</h3>
              <p className="text-xs text-muted-foreground text-center">{t("noCorsIssues")}</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border backdrop-blur-sm">
              <div className="rounded-full bg-blue-500/10 p-3 mb-3">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">{t("betterAuth")}</h3>
              <p className="text-xs text-muted-foreground text-center">{t("secureByDefault")}</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border backdrop-blur-sm">
              <div className="rounded-full bg-purple-500/10 p-3 mb-3">
                <Palette className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">{t("colorThemes")}</h3>
              <p className="text-xs text-muted-foreground text-center">{t("darkModeReady")}</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border backdrop-blur-sm">
              <div className="rounded-full bg-teal-500/10 p-3 mb-3">
                <Globe className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">{t("i18nReady")}</h3>
              <p className="text-xs text-muted-foreground text-center">{t("multiLanguage")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section-muted">
        <div className="landing-container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t("everythingYouNeed")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("preConfiguredDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">{t("lightningFast")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("lightningFastDescription")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{t("secureAuthentication")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("secureAuthDescription")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">{t("beautifulThemes")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("beautifulThemesDescription")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">{t("databaseReady")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("databaseReadyDescription")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">{t("developerExperience")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("developerExperienceDescription")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-pink-500" />
                  <CardTitle className="text-lg">{t("mobileFirst")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("mobileFirstDescription")}
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
              {t("builtWithModernTech")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("carefullySelectedTools")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { name: 'Next.js 15', category: t('framework') },
              { name: 'React 19', category: t('library') }, 
              { name: 'TypeScript', category: t('language') },
              { name: 'Tailwind CSS', category: t('styling') },
              { name: 'Better Auth', category: t('authentication') },
              { name: 'Prisma ORM', category: t('database') },
              { name: 'PostgreSQL', category: t('database') },
              { name: 'Vercel', category: t('deployment') }
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
                  {t("readyToGetStarted")}
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {t("cloneRepositoryDescription")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-base px-8">
                    <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                      {t("startBuildingNow")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base px-8">
                    <Link href="/login">
                      {t("signIn")}
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