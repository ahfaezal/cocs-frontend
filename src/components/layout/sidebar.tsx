"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { sidebarMenu } from "@/data/menu";
import {
  buildProjectHref,
  getActiveProjectId,
  isProjectWorkflowPath,
  setActiveProjectId,
} from "@/lib/active-project";
import { hasAnyPermission } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
};

function matchesPath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
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
    <aside
      className={`flex min-h-screen flex-col bg-[#071d49] text-white transition-all duration-300 ${
        collapsed ? "w-[88px]" : "w-[290px]"
      }`}
    >
      <div className={`border-b border-white/10 py-5 ${collapsed ? "px-3" : "px-6"}`}>
        <div
          className={`flex ${
            collapsed
              ? "flex-col items-center gap-3"
              : "items-start justify-between gap-3"
          }`}
        >
          <div className={collapsed ? "text-center" : ""}>
            <div className="text-3xl font-bold tracking-wide">CIDB</div>
            {!collapsed ? (
              <>
                <div className="mt-2 text-2xl font-bold">COCS BUILDER</div>
                <div className="mt-1 text-sm text-white/80">
                  Construction Occupational Competency Standards
                </div>
              </>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? "Buka menu tepi" : "Sorok menu tepi"}
            className="rounded-xl border border-white/10 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </div>

      <nav className={`flex-1 space-y-6 py-4 ${collapsed ? "px-2" : "px-3"}`}>
        {visibleSections.map((section) => (
          <div key={section.section}>
            {section.title && !collapsed ? (
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
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
                      collapsed ? "justify-center px-3" : "gap-3 px-4"
                    } ${
                      active
                        ? "bg-blue-600 text-white shadow-md"
                        : collapsed
                          ? "text-white/90 hover:bg-white/10"
                          : "text-white/90 hover:bg-white/10 hover:pl-5"
                    }`}
                  >
                    <Icon size={18} />
                    {!collapsed ? <span>{item.label}</span> : null}
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
