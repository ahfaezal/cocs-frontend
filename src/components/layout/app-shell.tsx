"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getAuthToken } from "@/lib/auth";
import {
  getActiveProjectId,
  isProjectWorkflowPath,
  setActiveProjectId,
  setLastWorkPage,
} from "@/lib/active-project";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

function ProjectRouteMemory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!isProjectWorkflowPath(pathname)) return;

    const projectId = searchParams.get("projectId") || "";
    const query = searchParams.toString();
    const currentPath = query ? `${pathname}?${query}` : pathname;

    if (projectId) {
      setActiveProjectId(projectId);
      setLastWorkPage(currentPath);
      return;
    }

    const activeProjectId = getActiveProjectId();

    if (!activeProjectId) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("projectId", activeProjectId);
    router.replace(`${pathname}?${nextParams.toString()}`);
  }, [pathname, router, searchParams]);

  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Memeriksa sesi pengguna...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Suspense fallback={null}>
        <ProjectRouteMemory />
      </Suspense>
      <Suspense
        fallback={
          <aside className="min-h-screen w-[290px] bg-[#071d49]" />
        }
      >
        <Sidebar />
      </Suspense>
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
