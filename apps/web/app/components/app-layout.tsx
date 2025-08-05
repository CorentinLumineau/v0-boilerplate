"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

const publicRoutes = ["/landing", "/login", "/signup"];
const authRoutes = ["/login", "/signup"];

interface AppLayoutProps {
  children: React.ReactNode;
  version: string;
}

export function AppLayout({ children, version }: AppLayoutProps) {
  // Let route group layouts handle their own UI structure
  // This component now just passes through children
  return <>{children}</>;
}