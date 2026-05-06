"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronRight,
  FileText,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { ProjectFormStepper } from "@/components/projects/project-form-stepper";
import {
  getMSICGroupLabel,
  getMSICGroupsBySection,
  getMSICSectionLabel,
  MSIC_SECTIONS,
} from "@/data/msic-2008";
import { getAuthToken } from "@/lib/auth";
import { API_URL } from "@/lib/env";
import { hasPermission } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";

export default function NewProjectPage() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const canCreateProject = hasPermission(currentUser.role, "project:create");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
  tajukProjek: "",
  jenis: "Baharu",
  tahap: "",
  sektor: "",
  subsektor: "",
  area: "",
  subarea: "",
  ringkasan: "",
});

  const selectedMSICGroups = getMSICGroupsBySection(form.sektor);

  function updateField(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateSector(value: string) {
    setForm((prev) => ({
      ...prev,
      sektor: value,
      subsektor: "",
      msic: "",
    }));
  }

  function updateSubsector(value: string) {
    setForm((prev) => ({
      ...prev,
      subsektor: value,
      msic: value,
    }));
  }

  async function handleSaveDraft(next = false) {
    if (!canCreateProject) {
      setErrorMessage("Anda tidak mempunyai kebenaran untuk mencipta projek.");
      return;
    }

    if (!form.tajukProjek.trim()) {
      setErrorMessage("Sila masukkan Tajuk Projek.");
      return;
    }

    if (!form.sektor) {
      setErrorMessage("Sila pilih Sektor MSIC 2008.");
      return;
    }

    if (!form.subsektor) {
      setErrorMessage("Sila pilih Subsektor MSIC 2008.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const tahapNumber = Number(String(form.tahap).replace(/\D/g, "")) || 1;
      const tahunNumber = new Date().getFullYear();

      const projectCode = `COCS/${tahunNumber}/${Date.now()
        .toString()
        .slice(-4)}`;

      const payload = {
        project_code: projectCode,
        code: projectCode,
        kodProjek: projectCode,

        title: form.tajukProjek.trim(),
        project_title: form.tajukProjek.trim(),

        type: form.jenis,
        jenis: form.jenis,

        level: tahapNumber,
        tahap: tahapNumber,

        target_year: tahunNumber,
        tahun: tahunNumber,

        sector: form.sektor,
        sector_name: getMSICSectionLabel(form.sektor),

        subsector: form.subsektor,
        subsector_name: getMSICGroupLabel(form.subsektor),

        area: form.area,
        subarea: form.subarea,

        summary: form.ringkasan,
        description: form.ringkasan,

        msic_code: form.subsektor,

        status: "draft",
        progress: 0,
      };


      const token = getAuthToken();

      const res = await fetch(`${API_URL}/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();

      if (!res.ok) {
        let apiMessage = "Gagal menyimpan projek. Sila semak API projek.";

        try {
          const errorData = responseText ? JSON.parse(responseText) : null;
          apiMessage = errorData?.detail || apiMessage;
        } catch {
          apiMessage = responseText || apiMessage;
        }

        if (res.status === 409) {
          setErrorMessage(
            "Projek dengan tajuk, subsektor dan tahap yang sama sudah wujud."
          );
          return null;
        }

        setErrorMessage(apiMessage);
        return null;
      }

      const result = responseText ? JSON.parse(responseText) : null;

      setMessage("Projek berjaya disimpan sebagai draf.");

      if (next) {
        router.push("/projects");
      }

      return result;
    } catch (error) {
      console.error("Gagal simpan projek:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan projek. Sila semak API projek."
      );

    } finally {
      setSaving(false);
    }
  }

  if (!canCreateProject) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-700">
          Anda tidak mempunyai kebenaran untuk mencipta projek baharu.
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Kembali ke Senarai Projek
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Projek COCS</span>
            <ChevronRight size={16} />
            <span>Permohonan Projek</span>
            <ChevronRight size={16} />
            <span className="font-medium text-blue-700">
              Cipta Projek Baharu
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Cipta Projek Baharu
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Lengkapkan maklumat asas untuk memulakan pembangunan COCS.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Kembali ke Senarai Projek
        </Link>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <ProjectFormStepper currentStep={1} />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold tracking-wide text-blue-700">
              MAKLUMAT ASAS PROJEK
            </h2>
          </div>
          
      <div className="xl:col-span-8">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Tajuk Projek <span className="text-red-500">*</span>
        </label>
        <input
          value={form.tajukProjek}
          onChange={(e) => updateField("tajukProjek", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Contoh: Railway Track Installation"
        />
      </div>

      <div className="xl:col-span-4">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Jenis Pembangunan <span className="text-red-500">*</span>
        </label>

        <div className="flex h-[50px] items-center gap-6 rounded-xl border border-slate-200 px-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="jenis-pembangunan"
              checked={form.jenis === "Baharu"}
              onChange={() => updateField("jenis", "Baharu")}
            />
            <span>Baharu</span>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="jenis-pembangunan"
              checked={form.jenis === "Kaji Semula"}
              onChange={() => updateField("jenis", "Kaji Semula")}
            />
            <span>Kaji Semula</span>
          </label>
        </div>
      </div>

      <div className="xl:col-span-4">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Tahap Sasaran <span className="text-red-500">*</span>
        </label>
        <select
          value={form.tahap}
          onChange={(e) => updateField("tahap", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Sila pilih tahap (1-6)</option>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <option key={level} value={String(level)}>
              Tahap {level}
            </option>
          ))}
        </select>
      </div>

      <div className="xl:col-span-4">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Sektor <span className="text-red-500">*</span>
        </label>
        <select
          value={form.sektor}
          onChange={(e) => updateSector(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Sila pilih sektor MSIC 2008</option>
          {MSIC_SECTIONS.map((section) => (
            <option key={section.code} value={section.code}>
              {section.code} - {section.title}
            </option>
          ))}
        </select>
      </div>

      <div className="xl:col-span-4">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Subsektor <span className="text-red-500">*</span>
        </label>
        <select
          value={form.subsektor}
          onChange={(e) => updateSubsector(e.target.value)}
          disabled={!form.sektor}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">
            {form.sektor
              ? "Sila pilih subsektor / group 3 digit"
              : "Pilih sektor dahulu"}
          </option>
          {selectedMSICGroups.map((group) => (
            <option key={group.code} value={group.code}>
              {group.code} - {group.title}
            </option>
          ))}
        </select>
      </div>

      <div className="xl:col-span-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Area
        </label>
        <input
          value={form.area}
          onChange={(e) => updateField("area", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Contoh: Production, QC, R&D"
        />
      </div>

      <div className="xl:col-span-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Subarea
        </label>
        <input
          value={form.subarea}
          onChange={(e) => updateField("subarea", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Tidak wajib"
        />
      </div>

          <div className="flex flex-wrap items-center justify-end border-t border-slate-200 px-8 py-5">
            <button
              type="button"
              onClick={() => handleSaveDraft(true)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Seterusnya"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
