"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronRight,
  FileText,
  X,
  Save,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { ProjectFormStepper } from "@/components/projects/project-form-stepper";
import { API_URL } from "@/lib/env";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    tajukProjek: "",
    jenis: "Baharu",
    bidangTred: "",
    occupation: "",
    tahap: "",
    tahun: "",
    sektor: "",
    subsektor: "",
    area: "",
    ringkasan: "",
    msic: "",
    masco: "",
    akta520: "",
    versiStandard: "",
  });

  function updateField(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveDraft(next = false) {
    if (!form.tajukProjek.trim()) {
      setErrorMessage("Sila masukkan Tajuk Projek.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const tahapNumber = Number(String(form.tahap).replace(/\D/g, "")) || 1;
      const tahunNumber = Number(form.tahun) || new Date().getFullYear();

      const projectCode = `COCS/${tahunNumber}/${Date.now()
        .toString()
        .slice(-4)}`;

      const payload = {
        project_code: projectCode,
        code: projectCode,
        kodProjek: projectCode,

        title: form.tajukProjek.trim(),
        project_title: form.tajukProjek.trim(),

        bidang: form.bidangTred,
        field: form.bidangTred,

        occupation: form.occupation,

        level: tahapNumber,
        tahap: tahapNumber,

        target_year: tahunNumber,
        tahun: tahunNumber,

        sector: form.sektor,
        subsector: form.subsektor,
        area: form.area,

        summary: form.ringkasan,
        description: form.ringkasan,

        msic_code: form.msic,
        masco_code: form.masco,
        act_520_reference: form.akta520,
        standard_version: form.versiStandard,

        type: form.jenis,
        jenis: form.jenis,

        status: "draft",
        progress: 0,
      };

      console.log("PROJECT PAYLOAD:", payload);

      const res = await fetch(`${API_URL}/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log("PROJECT API RESPONSE:", responseText);

      if (!res.ok) {
        throw new Error(responseText || "Gagal menyimpan projek.");
      }

      const result = responseText ? JSON.parse(responseText) : null;

      setMessage("Projek berjaya disimpan sebagai draf.");

      if (next) {
        router.push("/projects");
      }

      return result;
    } catch (error) {
      console.error("Gagal simpan projek:", error);
      setErrorMessage("Gagal menyimpan projek. Sila semak API projek.");
    } finally {
      setSaving(false);
    }
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

          <div className="space-y-8 px-6 py-6">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tajuk Projek <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.tajukProjek}
                  onChange={(e) => updateField("tajukProjek", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Standard Kemahiran Pemasangan Bata (Bricklaying) Tahap 3"
                />
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kod Projek
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                  placeholder="Akan dijana secara automatik"
                  disabled
                />
              </div>

              <div className="xl:col-span-3">
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

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bidang Pekerjaan <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.bidangTred}
                  onChange={(e) => updateField("bidangTred", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Sila pilih bidang</option>
                  <option value="Building Construction">
                    Building Construction
                  </option>
                  <option value="Mechanical & Electrical">
                    Mechanical & Electrical
                  </option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Railway">Railway</option>
                </select>
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tred / Occupation <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.occupation}
                  onChange={(e) => updateField("occupation", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Bricklayer"
                />
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tahap Sasaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.tahap}
                  onChange={(e) => updateField("tahap", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Sila pilih tahap (1–6)</option>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={String(level)}>
                      Tahap {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tahun Sasaran <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.tahun}
                  onChange={(e) => updateField("tahun", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: 2026"
                />
              </div>

              <div className="xl:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sektor <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.sektor}
                  onChange={(e) => updateField("sektor", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Construction"
                />
              </div>

              <div className="xl:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subsektor <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.subsektor}
                  onChange={(e) => updateField("subsektor", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Wet Trade"
                />
              </div>

              <div className="xl:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Area
                </label>
                <input
                  value={form.area}
                  onChange={(e) => updateField("area", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Bricklaying"
                />
              </div>

              <div className="xl:col-span-12">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Ringkasan Projek <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.ringkasan}
                  onChange={(e) => updateField("ringkasan", e.target.value)}
                  maxLength={500}
                  className="min-h-[150px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Nyatakan ringkasan projek secara ringkas..."
                />
                <div className="mt-2 text-right text-xs text-slate-400">
                  {form.ringkasan.length} / 500
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h3 className="mb-5 text-base font-bold tracking-wide text-blue-700">
                KLASIFIKASI & RUJUKAN
              </h3>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <input
                  value={form.msic}
                  onChange={(e) => updateField("msic", e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  placeholder="Kod MSIC, cth: 41001"
                />

                <input
                  value={form.masco}
                  onChange={(e) => updateField("masco", e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  placeholder="Kod MASCO, cth: 7111-01"
                />

                <input
                  value={form.akta520}
                  onChange={(e) => updateField("akta520", e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  placeholder="Rujukan Akta 520"
                />

                <input
                  value={form.versiStandard}
                  onChange={(e) =>
                    updateField("versiStandard", e.target.value)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  placeholder="Versi Standard"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <X size={16} />
              Batal
            </Link>

            <button
              type="button"
              onClick={() => handleSaveDraft(false)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Menyimpan..." : "Simpan Draf"}
            </button>

            <button
              type="button"
              onClick={() => handleSaveDraft(true)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
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