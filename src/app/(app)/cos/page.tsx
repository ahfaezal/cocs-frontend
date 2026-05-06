"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronRight, Info, Plus, Trash2 } from "lucide-react";

import { getAuthToken } from "@/lib/auth";
import { API_URL } from "@/lib/env";
import { hasPermission } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";

type ProjectInfo = {
  id: string;
  code: string;
  title: string;
  sector: string;
  subsector: string;
  area: string;
  level: string;
  status: string;
};

type COSMatrix = {
  subareas: string[];
  levels: Record<number, string[]>;
  selectedTarget: {
    level: number;
    columnIndex: number;
  } | null;
};

function COSDocumentMode({
  projectInfo,
  matrix,
}: {
  projectInfo: ProjectInfo;
  matrix: COSMatrix;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-900">
        Construction Occupational Structure (COS)
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-black text-sm text-black">
          <tbody>
            <tr>
              <th className="w-32 border border-black bg-slate-200 px-4 py-3 text-left">
                Sector
              </th>
              <td
                colSpan={matrix.subareas.length}
                className="border border-black bg-slate-200 px-4 py-3 text-center font-bold"
              >
                {projectInfo.sector}
              </td>
            </tr>

            <tr>
              <th className="border border-black bg-slate-200 px-4 py-3 text-left">
                Sub Sector
              </th>
              <td
                colSpan={matrix.subareas.length}
                className="border border-black bg-slate-200 px-4 py-3 text-center font-bold"
              >
                {projectInfo.subsector}
              </td>
            </tr>

            <tr>
              <th
                rowSpan={2}
                className="border border-black bg-slate-200 px-4 py-3 text-left"
              >
                Area
              </th>
              <td
                colSpan={matrix.subareas.length}
                className="border border-black bg-slate-200 px-4 py-3 text-center font-bold"
              >
                {projectInfo.area}
              </td>
            </tr>

            <tr>
              {matrix.subareas.map((subarea, index) => (
                <td
                  key={`doc-subarea-${index}`}
                  className="border border-black bg-slate-200 px-4 py-3 text-center font-bold"
                >
                  {subarea || `Subarea ${index + 1}`}
                </td>
              ))}
            </tr>

            {LEVELS.map((level) => (
              <tr key={`doc-level-${level}`}>
                <th className="border border-black px-4 py-3 text-left">
                  Level {level}
                </th>

                {matrix.levels[level].map((value, columnIndex) => (
                  <td
                    key={`doc-level-${level}-${columnIndex}`}
                    className="border border-black px-4 py-3 text-center"
                  >
                    {value || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const LEVELS = [6, 5, 4, 3, 2, 1];

function createEmptyMatrix(): COSMatrix {
  return {
    subareas: ["Subarea 1", "Subarea 2"],
    levels: {
      6: ["", ""],
      5: ["", ""],
      4: ["", ""],
      3: ["", ""],
      2: ["", ""],
      1: ["", ""],
    },
    selectedTarget: null,
  };
}

function getStorageKey(projectId: string) {
  return `cocs-cos-structure-${projectId}`;
}

function getTargetStorageKey(projectId: string) {
  return `cocs-target-occupation-${projectId}`;
}

function COSPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();

  const projectId = searchParams.get("projectId") || "";
  const canEditCOS = hasPermission(currentUser.role, "content:update_assigned");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    id: "",
    code: "-",
    title: "-",
    sector: "-",
    subsector: "-",
    area: "-",
    level: "-",
    status: "draft",
  });

  const [matrix, setMatrix] = useState<COSMatrix>(() => createEmptyMatrix());
  const [viewMode, setViewMode] = useState<"builder" | "document">("builder");

  const storageKey = useMemo(
    () => (projectId ? getStorageKey(projectId) : ""),
    [projectId]
  );

  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setLoading(false);
        setErrorMessage("Sila pilih projek daripada Senarai Projek COCS dahulu.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const token = getAuthToken();

        const res = await fetch(`${API_URL}/projects/${projectId}`, {
          cache: "no-store",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Gagal mendapatkan maklumat projek.");
        }

        const data = await res.json();

        setProjectInfo({
          id: String(data.id),
          code: data.project_code || data.code || `COCS/${data.id}`,
          title: data.project_title || data.title || "-",
          sector: data.sector_name || data.sector || "-",
          subsector: data.subsector_name || data.subsector || data.field || "-",
          area: data.area || "-",
          level: String(data.level || data.tahap || "-"),
          status: data.status || "draft",
        });
      } catch (error) {
        console.error("Gagal load project COS:", error);
        setErrorMessage("Gagal memuatkan maklumat projek COS.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (!storageKey) return;

    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      setMatrix(createEmptyMatrix());
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      setMatrix({
        ...createEmptyMatrix(),
        ...parsed,
        selectedTarget: parsed.selectedTarget ?? null,
      });
    } catch {
      setMatrix(createEmptyMatrix());
    }
  }, [storageKey]);

  function updateSubarea(index: number, value: string) {
    setMatrix((prev) => ({
      ...prev,
      subareas: prev.subareas.map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  }

  function addSubarea() {
    setMatrix((prev) => {
      const nextSubareas = [
        ...prev.subareas,
        `Subarea ${prev.subareas.length + 1}`,
      ];

      const nextLevels = LEVELS.reduce<Record<number, string[]>>(
        (acc, level) => {
          acc[level] = [...prev.levels[level], ""];
          return acc;
        },
        {}
      );

      return {
        subareas: nextSubareas,
        levels: nextLevels,
        selectedTarget: prev.selectedTarget,
      };
    });
  }

  function deleteSubarea(index: number) {
    if (matrix.subareas.length <= 1) {
      alert("Sekurang-kurangnya satu column subarea diperlukan.");
      return;
    }

    const confirmDelete = window.confirm(
      "Padam subarea ini? Semua jawatan dalam column ini juga akan dipadam."
    );

    if (!confirmDelete) return;

    setMatrix((prev) => {
      const nextSubareas = prev.subareas.filter(
        (_, itemIndex) => itemIndex !== index
      );

      const nextLevels = LEVELS.reduce<Record<number, string[]>>(
        (acc, level) => {
          acc[level] = prev.levels[level].filter(
            (_, itemIndex) => itemIndex !== index
          );
          return acc;
        },
        {}
      );

      const selectedTarget =
        prev.selectedTarget && prev.selectedTarget.columnIndex === index
          ? null
          : prev.selectedTarget && prev.selectedTarget.columnIndex > index
            ? {
                ...prev.selectedTarget,
                columnIndex: prev.selectedTarget.columnIndex - 1,
              }
            : prev.selectedTarget;

      return {
        subareas: nextSubareas,
        levels: nextLevels,
        selectedTarget,
      };
    });
  }

  function updateLevelValue(level: number, columnIndex: number, value: string) {
    setMatrix((prev) => ({
      ...prev,
      levels: {
        ...prev.levels,
        [level]: prev.levels[level].map((item, itemIndex) =>
          itemIndex === columnIndex ? value : item
        ),
      },
    }));
  }

  function selectTargetOccupation(level: number, columnIndex: number) {
    setMatrix((prev) => ({
      ...prev,
      selectedTarget: {
        level,
        columnIndex,
      },
    }));
  }

  const selectedTargetTitle = matrix.selectedTarget
    ? matrix.levels[matrix.selectedTarget.level]?.[
        matrix.selectedTarget.columnIndex
      ] || ""
    : "";

  const selectedTargetSubarea = matrix.selectedTarget
    ? matrix.subareas[matrix.selectedTarget.columnIndex] || ""
    : "";

  function saveAndNext() {
    if (!projectId || !storageKey) {
      setErrorMessage("Project ID tidak ditemui. Sila pilih projek dahulu.");
      return;
    }

    if (!matrix.selectedTarget) {
      setErrorMessage("Sila pilih satu jawatan sebagai Tajuk Fokus.");
      return;
    }

    const selectedTitle =
      matrix.levels[matrix.selectedTarget.level]?.[
        matrix.selectedTarget.columnIndex
      ] || "";

    if (!selectedTitle.trim()) {
      setErrorMessage("Jawatan Tajuk Fokus tidak boleh kosong.");
      return;
    }

    const targetPayload = {
      projectId,
      occupationTitle: selectedTitle.trim(),
      subarea: selectedTargetSubarea,
      level: matrix.selectedTarget.level,
      columnIndex: matrix.selectedTarget.columnIndex,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(matrix));
    window.localStorage.setItem(
      getTargetStorageKey(projectId),
      JSON.stringify(targetPayload)
    );

    router.push(`/ccpc?projectId=${projectId}`);
  }

  if (!projectId) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-medium text-amber-800">
          Sila pilih projek daripada Senarai Projek COCS terlebih dahulu.
        </div>

        <button
          type="button"
          onClick={() => router.push("/projects")}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Pergi ke Senarai Projek
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">Projek:</span>
            <span className="text-2xl font-bold text-blue-700">
              {projectInfo.code} - {projectInfo.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Status:</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {projectInfo.status}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Dashboard</span>
            <ChevronRight size={16} />
            <span>Projek COCS</span>
            <ChevronRight size={16} />
            <span className="font-medium text-slate-700">
              Occupational Analysis (COS)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <Info size={20} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Occupational Analysis (COS)
              </h1>
            </div>
          </div>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("builder")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${
              viewMode === "builder"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Builder Mode
          </button>

          <button
            type="button"
            onClick={() => setViewMode("document")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${
              viewMode === "document"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Document Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm lg:grid-cols-5">
        <div>
          <p className="text-sm text-slate-500">Sektor</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {loading ? "Memuatkan..." : projectInfo.sector}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Subsektor</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {loading ? "Memuatkan..." : projectInfo.subsector}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Area</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {loading ? "Memuatkan..." : projectInfo.area}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Tahap Sasaran Standard</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            Level {projectInfo.level}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Tarikh Kemaskini</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {new Date().toLocaleDateString("ms-MY")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 shadow-sm">
        <div className="text-sm font-semibold text-blue-700">Tajuk Fokus</div>

        {selectedTargetTitle ? (
          <>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {selectedTargetTitle}
            </div>

            <div className="mt-2 text-sm text-slate-600">
              Subarea:{" "}
              <span className="font-semibold">{selectedTargetSubarea}</span>
              {" | "}
              Tahap:{" "}
              <span className="font-semibold">
                Level {matrix.selectedTarget?.level}
              </span>
            </div>
          </>
        ) : (
          <div className="mt-1 text-sm text-slate-600">
            Pilih satu jawatan pada row tahap sasaran untuk dijadikan tajuk utama dokumen.
          </div>
        )}
      </div>

      {viewMode === "document" ? (
        <COSDocumentMode projectInfo={projectInfo} matrix={matrix} />
      ) : (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-blue-700">
              Construction Occupational Structure (COS)
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lengkapkan struktur pekerjaan berdasarkan perbincangan bersama ahli panel.
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Nama jawatan yang dipilih sebagai Tajuk Fokus akan digunakan sebagai tajuk utama dokumen.
            </p>
          </div>

          {canEditCOS ? (
            <button
              type="button"
              onClick={addSubarea}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <Plus size={16} />
              Tambah Subarea
            </button>
          ) : null}
        </div>

        <div className="overflow-x-auto p-6">
          <table className="min-w-full border border-slate-300 text-sm">
            <tbody>
              <tr className="bg-slate-100">
                <th className="w-32 border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                  Sector
                </th>
                <td
                  colSpan={matrix.subareas.length}
                  className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-900"
                >
                  {projectInfo.sector}
                </td>
              </tr>

              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                  Sub Sector
                </th>
                <td
                  colSpan={matrix.subareas.length}
                  className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-900"
                >
                  {projectInfo.subsector}
                </td>
              </tr>

              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                  Area
                </th>
                <td
                  colSpan={matrix.subareas.length}
                  className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-900"
                >
                  {projectInfo.area}
                </td>
              </tr>

              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                  Subarea
                </th>
                {matrix.subareas.map((subarea, index) => (
                  <td
                    key={`subarea-${index}`}
                    className="border border-slate-300 px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={subarea}
                        onChange={(event) =>
                          updateSubarea(index, event.target.value)
                        }
                        disabled={!canEditCOS}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center font-semibold text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-50"
                        placeholder={`Subarea ${index + 1}`}
                      />

                      {canEditCOS && matrix.subareas.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => deleteSubarea(index)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                          title="Padam subarea"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                ))}
              </tr>

              {LEVELS.map((level) => {
                const target = String(level) === String(projectInfo.level);

                return (
                  <tr
                    key={level}
                    className={target ? "bg-emerald-50" : "bg-white"}
                  >
                    <th className="border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                      Level {level}
                    </th>

                    {matrix.levels[level].map((value, columnIndex) => (
                      <td
                        key={`${level}-${columnIndex}`}
                        className="border border-slate-300 px-3 py-3"
                      >
                        <input
                          value={value}
                          onChange={(event) =>
                            updateLevelValue(
                              level,
                              columnIndex,
                              event.target.value
                            )
                          }
                          disabled={!canEditCOS}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-50"
                          placeholder="Masukkan jawatan"
                        />

                        {target ? (
                          <>
                            <label className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                              <input
                                type="radio"
                                name="cos-target-occupation"
                                checked={
                                  matrix.selectedTarget?.level === level &&
                                  matrix.selectedTarget?.columnIndex ===
                                    columnIndex
                                }
                                onChange={() =>
                                  selectTargetOccupation(level, columnIndex)
                                }
                                disabled={!canEditCOS}
                              />
                              Pilih Tajuk Fokus
                            </label>

                            <div className="mt-1 text-center text-xs font-semibold text-emerald-600">
                              TAHAP SASARAN
                            </div>
                          </>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      )}

      <div className="flex flex-wrap items-center justify-end">
        <button
          type="button"
          onClick={saveAndNext}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Simpan & Seterusnya
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function COSPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Memuatkan halaman COS...
        </div>
      }
    >
      <COSPageContent />
    </Suspense>
  );
}
