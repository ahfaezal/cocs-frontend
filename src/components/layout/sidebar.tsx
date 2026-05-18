"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { sidebarMenu } from "@/data/menu";
import {
  buildProjectHref,
  getActiveProjectId,
  isProjectWorkflowPath,
  setActiveProjectId,
} from "@/lib/active-project";
import { hasAnyPermission } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";

function matchesPath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const [activeProjectId, setActiveProjectIdState] = useState("");

  useEffect(() => {
    const projectId = searchParams.get("projectId") || getActiveProjectId();

    if (!projectId) return;

    setActiveProjectId(projectId);
    setActiveProjectIdState(projectId);
  }, [searchParams]);

  const visibleSections = sidebarMenu
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        hasAnyPermission(currentUser.role, item.permissions)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const activeHref = visibleSections
    .flatMap((section) => section.items)
    .filter((item) => matchesPath(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <aside className="flex min-h-screen w-[290px] flex-col bg-[#071d49] text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="text-3xl font-bold tracking-wide">CIDB</div>
        <div className="mt-2 text-2xl font-bold">COCS BUILDER</div>
        <div className="mt-1 text-sm text-white/80">
          Construction Occupational Competency Standards
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-4">
        {visibleSections.map((section) => (
          <div key={section.section}>
            {section.title ? (
              <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                {section.title}
              </div>
            ) : null}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeHref === item.href;
                const href = isProjectWorkflowPath(item.href)
                  ? buildProjectHref(item.href, activeProjectId)
                  : item.href;

                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-white/90 hover:bg-white/10 hover:pl-5"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
