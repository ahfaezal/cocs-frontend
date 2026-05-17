"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ChevronRight,
  FileText,
  ArrowRight,
  ArrowLeft,
  Save,
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

function NewProjectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const isEditMode = Boolean(projectId);
  const currentUser = useCurrentUser();
  const canCreateProject = hasPermission(currentUser.role, "project:create");
  const canUpdateProject = hasPermission(
    currentUser.role,
    "content:update_assigned"
  );
  const canManageProject = isEditMode ? canUpdateProject : canCreateProject;

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedProjectId, setSavedProjectId] = useState(projectId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(!isEditMode);

  const [form, setForm] = useState({
  kodProjek: "",
  tajukProjek: "",
  jenis: "Baharu",
  tahap: "",
  sektor: "",
  subsektor: "",
  area: "",
  subarea: "",
  ringkasan: "",
  status: "draft",
});

  const selectedMSICGroups = getMSICGroupsBySection(form.sektor);

  function updateField(name: keyof typeof form, value: string) {
    setHasUnsavedChanges(true);
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateSector(value: string) {
    setHasUnsavedChanges(true);
    setForm((prev) => ({
      ...prev,
      sektor: value,
      subsektor: "",
      msic: "",
    }));
  }

  function updateSubsector(value: string) {
    setHasUnsavedChanges(true);
    setForm((prev) => ({
      ...prev,
      subsektor: value,
      msic: value,
    }));
  }

  function rememberActiveProject(id: string, title: string) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem("cocs_active_project_id", id);
    window.localStorage.setItem("cocs_active_project_title", title);
  }

  useEffect(() => {
    if (!isEditMode) return;

    async function loadProject() {
      try {
        setSaving(true);
        setErrorMessage("");

        const token = getAuthToken();
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
          cache: "no-store",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Gagal memuatkan maklumat projek.");
        }

        const data = await res.json();

        setForm({
          kodProjek: data.project_code || data.code || "",
          tajukProjek: data.project_title || data.title || "",
          jenis: data.type || data.jenis || "Baharu",
          tahap: String(data.level || data.tahap || ""),
          sektor: data.sector || "",
          subsektor: data.subsector || data.msic_code || "",
          area: data.area || "",
          subarea: data.subarea || "",
          ringkasan: data.summary || data.description || "",
          status: data.status || "draft",
        });

        setSavedProjectId(projectId);
        setHasUnsavedChanges(false);
        rememberActiveProject(
          projectId,
          data.project_title || data.title || "Projek COCS"
        );
      } catch (error) {
        console.error("Gagal load projek:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal memuatkan maklumat projek."
        );
      } finally {
        setSaving(false);
      }
    }

    loadProject();
  }, [isEditMode, projectId]);

  async function handleSaveDraft() {
    if (!canManageProject) {
      setErrorMessage(
        isEditMode
          ? "Anda tidak mempunyai kebenaran untuk mengemaskini projek."
          : "Anda tidak mempunyai kebenaran untuk mencipta projek."
      );
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

      const parsedTahap = Number(String(form.tahap).replace(/\D/g, ""));
      const tahapNumber = parsedTahap >= 1 && parsedTahap <= 6 ? parsedTahap : null;
      const tahunNumber = new Date().getFullYear();
      const persistedProjectId = savedProjectId || projectId;
      const shouldUpdateExisting = Boolean(persistedProjectId);

      const projectCode = shouldUpdateExisting
        ? form.kodProjek
        : `COCS/${tahunNumber}/${Date.now()
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

        status: form.status || "draft",
        progress: 0,
      };


      const token = getAuthToken();

      const res = await fetch(
        shouldUpdateExisting
          ? `${API_URL}/projects/${persistedProjectId}`
          : `${API_URL}/projects/`,
        {
        method: shouldUpdateExisting ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        }
      );

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
      const resolvedProjectId = String(result?.id || persistedProjectId || "");

      setMessage(
        shouldUpdateExisting
          ? "Projek berjaya dikemaskini."
          : "Projek berjaya disimpan sebagai draf."
      );

      if (resolvedProjectId) {
        setSavedProjectId(resolvedProjectId);
        setHasUnsavedChanges(false);
        rememberActiveProject(resolvedProjectId, form.tajukProjek.trim());
        setForm((prev) => ({
          ...prev,
          kodProjek: projectCode,
        }));
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

  function handleNext() {
    if (!savedProjectId || hasUnsavedChanges) {
      setErrorMessage(
        "Sila klik Save dan pastikan maklumat projek berjaya disimpan sebelum meneruskan ke COS."
      );
      return;
    }

    router.push(`/cos?projectId=${savedProjectId}`);
  }

  if (!canManageProject) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-700">
          {isEditMode
            ? "Anda tidak mempunyai kebenaran untuk mengemaskini projek."
            : "Anda tidak mempunyai kebenaran untuk mencipta projek baharu."}
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
              {isEditMode ? "Kemaskini Projek" : "Cipta Projek Baharu"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {isEditMode ? "Kemaskini Projek" : "Cipta Projek Baharu"}
              </h1>
              <p className="mt-1 text-base text-slate-500">
                {isEditMode
                  ? "Kemaskini maklumat asas projek COCS."
                  : "Lengkapkan maklumat asas untuk memulakan pembangunan COCS."}
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
            <p className="mt-1 text-sm text-slate-500">
              Maklumat ini menjadi konteks awal untuk AI semasa proses COS, CCPC dan dokumen seterusnya.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 px-6 py-5 xl:grid-cols-12">
      {isEditMode ? (
        <div className="xl:col-span-12">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Kod Projek
          </label>
          <input
            value={form.kodProjek}
            onChange={(e) => updateField("kodProjek", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Contoh: COCS/2026/0001"
          />
        </div>
      ) : null}
          
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
          Tahap Sasaran
        </label>
        <select
          value={form.tahap}
          onChange={(e) => updateField("tahap", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Belum ditetapkan - tentukan selepas COS/CCPC</option>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <option key={level} value={String(level)}>
              Tahap {level}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Boleh dibiarkan kosong jika tahap belum diputuskan atau projek berpotensi melibatkan gabungan beberapa tahap.
        </p>
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

      {isEditMode ? (
        <div className="xl:col-span-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="draft">Draft</option>
            <option value="active">Aktif</option>
            <option value="review">Menunggu Semakan</option>
            <option value="completed">Selesai</option>
            <option value="archived">Arkib</option>
          </select>
        </div>
      ) : null}

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

      <div className="xl:col-span-12">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Maklumat Ringkas Projek
        </label>
        <textarea
          value={form.ringkasan}
          onChange={(e) => updateField("ringkasan", e.target.value)}
          rows={5}
          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Contoh: Terangkan skop pekerjaan, lokasi/industri, aktiviti utama, isu keselamatan, teknologi, standard rujukan, atau objektif pembangunan COCS. Maklumat ini akan digunakan sebagai konteks awal AI."
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Ringkasan ini akan membantu AI memahami skop perbincangan sebelum menjana cadangan COS, CCPC, CCP dan CSP.
        </p>
      </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-8 py-5">
            <div className="text-sm text-slate-500">
              {savedProjectId && !hasUnsavedChanges
                ? "Maklumat projek telah disimpan dan sedia untuk proses COS."
                : "Klik Save dahulu untuk menyimpan maklumat projek."}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveDraft()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Menyimpan..." : "Save"}
              </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={saving || !savedProjectId || hasUnsavedChanges}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Seterusnya
              <ArrowRight size={16} />
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Memuatkan borang projek...
        </div>
      }
    >
      <NewProjectPageContent />
    </Suspense>
  );
}
