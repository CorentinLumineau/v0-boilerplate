"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

const publicRoutes = ["/login", "/signup"];

interface AppLayoutProps {
  children: React.ReactNode;
  version: string;
}

export function AppLayout({ children, version }: AppLayoutProps) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  // For public routes (login/signup), render without sidebar and header
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For authenticated routes, render with full layout
  return (
    <div className="flex h-screen">
      <Sidebar version={version} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}