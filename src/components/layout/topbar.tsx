"use client";

import { useRouter } from "next/navigation";
import { Bell, Building2, UserCircle2 } from "lucide-react";

import { clearAuthSession } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";

export function Topbar() {
  const router = useRouter();
  const selectedUser = useCurrentUser();

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex-1" />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          <Building2 size={18} />
          <span>{selectedUser.organization}</span>
        </div>

        <button className="relative rounded-xl p-2 hover:bg-slate-100">
          <Bell className="text-slate-700" size={22} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 rounded-xl px-2 py-1">
          <UserCircle2 size={40} className="text-slate-700" />

          <div className="text-left text-sm">
            <div className="font-semibold text-slate-900">
              {selectedUser.name}
            </div>
            <div className="text-slate-500">
              {ROLE_LABELS[selectedUser.role]}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Log Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
