"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

import { hasAnyPermission, type Permission } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";

type PermissionGuardProps = {
  permissions: Permission[];
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
};

export function PermissionGuard({
  permissions,
  children,
  fallbackTitle = "Akses tidak dibenarkan",
  fallbackMessage = "Anda tidak mempunyai kebenaran untuk membuka halaman ini.",
}: PermissionGuardProps) {
  const currentUser = useCurrentUser();
  const allowed = hasAnyPermission(currentUser.role, permissions);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-100 p-2">
            <ShieldAlert size={20} />
          </div>

          <div>
            <h1 className="text-lg font-bold">{fallbackTitle}</h1>
            <p className="mt-1 text-sm font-medium">{fallbackMessage}</p>

            <Link
              href="/dashboard"
              className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
