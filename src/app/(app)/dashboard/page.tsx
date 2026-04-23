import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  ClipboardCheck,
  Archive,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { mockProjects } from "@/data/mock-projects";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Selamat datang, Fasilitator Utama"
        description="Berikut ialah ringkasan aktiviti pembangunan COCS anda."
        icon={<LayoutDashboard size={20} />}
        breadcrumb={
          <span>
            Dashboard / <span className="font-medium text-slate-700">Utama</span>
          </span>
        }
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Lihat Semua Projek
            </Link>
            <Link
              href="/projects/new"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + Projek Baru
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Jumlah Projek"
          value="12"
          subtitle="Semua projek berdaftar"
          icon={<FolderKanban className="text-blue-700" />}
          accent="bg-blue-100"
          trend={
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Aktif
            </span>
          }
        />

        <StatCard
          title="Dalam Pembangunan"
          value="5"
          subtitle="Projek yang sedang berjalan"
          icon={<Wrench className="text-amber-700" />}
          accent="bg-amber-100"
          trend={
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              Fokus semasa
            </span>
          }
        />

        <StatCard
          title="Menunggu Semakan"
          value="3"
          subtitle="Perlu tindakan semakan"
          icon={<ClipboardCheck className="text-purple-700" />}
          accent="bg-purple-100"
          trend={
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
              Tertunggak
            </span>
          }
        />

        <StatCard
          title="Arkib"
          value="2"
          subtitle="Projek yang telah selesai"
          icon={<Archive className="text-red-700" />}
          accent="bg-red-100"
          trend={
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
              Selesai
            </span>
          }
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Senarai Projek Terkini
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ringkasan projek yang baru diwujudkan atau dikemas kini.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Semua Projek
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Kod Projek</th>
                <th className="px-4 py-3 font-semibold">Tajuk Projek</th>
                <th className="px-4 py-3 font-semibold">Bidang / Tred</th>
                <th className="px-4 py-3 font-semibold">Tahap</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Kemajuan</th>
              </tr>
            </thead>

            <tbody>
              {mockProjects.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-4 font-medium text-slate-800">
                    {item.kodProjek}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{item.tajukProjek}</td>
                  <td className="px-4 py-4 text-slate-700">{item.bidangTred}</td>
                  <td className="px-4 py-4 text-slate-700">Tahap {item.tahap}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-4">
                    <ProgressBar value={item.progress} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm text-slate-500">
            Menunjukkan {mockProjects.length} projek terkini.
          </p>

          <Link
            href="/projects"
            className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
          >
            Pergi ke pengurusan projek
          </Link>
        </div>
      </div>
    </div>
  );
}