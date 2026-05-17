"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronRight, Info, Plus, Save, Trash2 } from "lucide-react";

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

type COSDevelopmentTarget = {
  level: number;
  columnIndex: number;
  occupationTitle?: string;
  subarea?: string;
};

type COSMatrix = {
  subareas: string[];
  levels: Record<number, string[]>;
  selectedDevelopmentLevels: number[];
  selectedDevelopmentTargets: COSDevelopmentTarget[];
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

const COMPETENCY_LEVEL_DEFINITIONS: Record<number, string> = {
  1: "Basic general and foundation knowledge and skills under close supervision.",
  2: "Basic factual or operational knowledge and routine skills with limited autonomy under supervisor observation.",
  3: "Broad operational and theoretical knowledge for clearly defined skilled work with limited responsibility.",
  4: "Broad knowledge with some specialised skills to plan, coordinate and evaluate work within well-defined parameters.",
  5: "Integrated technical and theoretical competence for advanced skilled or professional work within specialised parameters.",
  6: "Specialised knowledge for advanced skilled or professional work, management functions and complex issue resolution.",
};

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
    selectedDevelopmentLevels: [],
    selectedDevelopmentTargets: [],
  };
}

function getDevelopmentTargets(matrix: COSMatrix) {
  return (matrix.selectedDevelopmentTargets ?? [])
    .map((target) => ({
      ...target,
      occupationTitle: matrix.levels[target.level]?.[target.columnIndex] || "",
      subarea: matrix.subareas[target.columnIndex] || "",
    }))
    .filter((target) => target.occupationTitle.trim());
}

function getSelectedDevelopmentLevels(matrix: COSMatrix) {
  return Array.from(
    new Set(getDevelopmentTargets(matrix).map((target) => target.level))
  ).sort((a, b) => a - b);
}

function normalizeMatrixForSave(matrix: COSMatrix): COSMatrix {
  const selectedDevelopmentTargets = getDevelopmentTargets(matrix);

  return {
    ...matrix,
    selectedDevelopmentTargets,
    selectedDevelopmentLevels: Array.from(
      new Set(selectedDevelopmentTargets.map((target) => target.level))
    ).sort((a, b) => a - b),
  };
}

async function loadCOSFromBackend(projectId: string) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/cos/structure/${projectId}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Gagal memuatkan struktur COS.");
  }

  return res.json() as Promise<{
    matrix: COSMatrix | null;
    target: unknown | null;
  }>;
}

async function saveCOSToBackend(
  projectId: string,
  matrix: COSMatrix,
  target: unknown
) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/cos/structure/${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ matrix, target }),
  });

  if (!res.ok) {
    throw new Error("Gagal menyimpan struktur COS.");
  }

  return res.json();
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
  const [saving, setSaving] = useState(false);
  const [hasSavedCOS, setHasSavedCOS] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

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
      if (!projectId) return;

      async function loadCOSStructure() {
        try {
          const backendData = await loadCOSFromBackend(projectId);

          if (backendData.matrix) {
            setMatrix({
              ...createEmptyMatrix(),
              ...backendData.matrix,
              selectedDevelopmentLevels:
                backendData.matrix.selectedDevelopmentLevels ?? [],
              selectedDevelopmentTargets:
                backendData.matrix.selectedDevelopmentTargets ?? [],
            });
            setHasSavedCOS(true);
            setHasUnsavedChanges(false);

            return;
          }

          setMatrix(createEmptyMatrix());
          setHasSavedCOS(false);
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error("Gagal load COS dari backend:", error);
          setErrorMessage("Gagal memuatkan struktur COS dari backend.");
          setMatrix(createEmptyMatrix());
          setHasSavedCOS(false);
          setHasUnsavedChanges(true);
        }
      }

      loadCOSStructure();
    }, [projectId]);


  function updateSubarea(index: number, value: string) {
    setMessage("");
    setHasUnsavedChanges(true);
    setMatrix((prev) => ({
      ...prev,
      subareas: prev.subareas.map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  }

  function addSubarea() {
    setMessage("");
    setHasUnsavedChanges(true);
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
        selectedDevelopmentLevels: prev.selectedDevelopmentLevels,
        selectedDevelopmentTargets: prev.selectedDevelopmentTargets ?? [],
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

    setMessage("");
    setHasUnsavedChanges(true);
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

      const selectedDevelopmentTargets = (prev.selectedDevelopmentTargets ?? [])
        .filter((target) => target.columnIndex !== index)
        .map((target) =>
          target.columnIndex > index
            ? { ...target, columnIndex: target.columnIndex - 1 }
            : target
        );

      return {
        subareas: nextSubareas,
        levels: nextLevels,
        selectedDevelopmentLevels: Array.from(
          new Set(selectedDevelopmentTargets.map((target) => target.level))
        ).sort((a, b) => a - b),
        selectedDevelopmentTargets,
      };
    });
  }

  function updateLevelValue(level: number, columnIndex: number, value: string) {
    setMessage("");
    setHasUnsavedChanges(true);
    setMatrix((prev) => {
      const currentTargets = prev.selectedDevelopmentTargets ?? [];
      const selectedDevelopmentTargets = value.trim()
        ? currentTargets
        : currentTargets.filter(
            (target) =>
              !(target.level === level && target.columnIndex === columnIndex)
          );

      return {
        ...prev,
        selectedDevelopmentTargets,
        selectedDevelopmentLevels: Array.from(
          new Set(selectedDevelopmentTargets.map((target) => target.level))
        ).sort((a, b) => a - b),
        levels: {
          ...prev.levels,
          [level]: prev.levels[level].map((item, itemIndex) =>
            itemIndex === columnIndex ? value : item
          ),
        },
      };
    });
  }

  function toggleDevelopmentTarget(level: number, columnIndex: number) {
    setMessage("");
    setErrorMessage("");
    setHasUnsavedChanges(true);
    setMatrix((prev) => {
      const currentTargets = prev.selectedDevelopmentTargets ?? [];
      const exists = currentTargets.some(
        (target) => target.level === level && target.columnIndex === columnIndex
      );

      const selectedDevelopmentTargets = exists
        ? currentTargets.filter(
            (target) =>
              !(target.level === level && target.columnIndex === columnIndex)
          )
        : [
            ...currentTargets,
            {
              level,
              columnIndex,
              occupationTitle: prev.levels[level]?.[columnIndex] || "",
              subarea: prev.subareas[columnIndex] || "",
            },
          ];

      return {
        ...prev,
        selectedDevelopmentTargets,
        selectedDevelopmentLevels: Array.from(
          new Set(selectedDevelopmentTargets.map((target) => target.level))
        ).sort((a, b) => a - b),
      };
    });
  }

  const selectedDevelopmentTargets = getDevelopmentTargets(matrix);
  const selectedDevelopmentLevels = getSelectedDevelopmentLevels(matrix);

  async function handleSaveCOS() {
    if (!projectId) {
      setErrorMessage("Project ID tidak ditemui. Sila pilih projek dahulu.");
      return false;
    }

    const nextMatrix = normalizeMatrixForSave(matrix);

    if (nextMatrix.selectedDevelopmentTargets.length === 0) {
      setErrorMessage(
        "Sila tick sekurang-kurangnya satu nama jawatan dalam jadual COS sebelum Save."
      );
      return false;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setMessage("");

      await saveCOSToBackend(
        projectId,
        nextMatrix,
        nextMatrix.selectedDevelopmentTargets[0] || null
      );

      setMatrix(nextMatrix);
      setHasSavedCOS(true);
      setHasUnsavedChanges(false);
      setMessage("COS berjaya disimpan. Anda boleh teruskan ke CCPC.");
      return true;
    } catch (error) {
      console.error("Gagal simpan COS:", error);
      setErrorMessage("Gagal menyimpan struktur COS ke backend.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function handleNext() {
    if (!hasSavedCOS || hasUnsavedChanges) {
      setErrorMessage("Sila klik Save untuk simpan COS sebelum meneruskan ke CCPC.");
      return;
    }

    if (selectedDevelopmentTargets.length === 0) {
      setErrorMessage(
        "Sila tick sekurang-kurangnya satu nama jawatan dalam jadual COS sebelum meneruskan ke CCPC."
      );
      return;
    }

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
          <p className="text-sm text-slate-500">Tahap Projek Awal</p>
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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-blue-700">
            Skop Tahap Pembangunan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Rujukan ringkas tahap CSQF. Pilihan sebenar dibuat melalui tick pada nama jawatan dalam jadual COS.
          </p>
        </div>

        <div className="grid gap-3 p-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <div
              key={`development-level-${level}`}
              className="min-h-28 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="font-bold text-slate-900">Level {level}</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {COMPETENCY_LEVEL_DEFINITIONS[level]}
              </p>
            </div>
          ))}
        </div>
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
              Tick nama jawatan yang hendak dibangunkan untuk proses CCPC.
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

              {LEVELS.map((level) => (
                  <tr
                    key={level}
                    className="bg-white"
                  >
                    <th className="border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                      Level {level}
                    </th>

                    {matrix.levels[level].map((value, columnIndex) => (
                      <td
                        key={`${level}-${columnIndex}`}
                        className="border border-slate-300 px-3 py-3"
                      >
                        {(() => {
                          const selectedForCCPC =
                            (matrix.selectedDevelopmentTargets ?? []).some(
                              (target) =>
                                target.level === level &&
                                target.columnIndex === columnIndex
                            );

                          return (
                            <>
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

                        <label
                          className={`mt-2 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                            selectedForCCPC
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-500"
                          } ${
                            !canEditCOS || !value.trim()
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer hover:border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedForCCPC}
                            onChange={() =>
                              toggleDevelopmentTarget(level, columnIndex)
                            }
                            disabled={!canEditCOS || !value.trim()}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Pilih untuk CCPC
                        </label>

                            </>
                          );
                        })()}
                      </td>
                    ))}
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {hasSavedCOS && !hasUnsavedChanges
            ? "COS telah disimpan dan sedia untuk proses CCPC."
            : "Tick nama jawatan yang hendak dibangunkan, kemudian klik Save sebelum bergerak ke langkah seterusnya."}
          {selectedDevelopmentTargets.length > 0 ? (
            <span className="ml-2 font-semibold text-blue-700">
              {selectedDevelopmentTargets.length} jawatan dipilih
              {selectedDevelopmentLevels.length > 0
                ? ` (${selectedDevelopmentLevels.map((level) => `Level ${level}`).join(", ")})`
                : ""}
            </span>
          ) : null}
        </p>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSaveCOS}
            disabled={saving || !canEditCOS}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            <Save size={16} />
            {saving ? "Menyimpan..." : "Save"}
          </button>

        <button
          type="button"
            onClick={handleNext}
            disabled={
              saving ||
              !hasSavedCOS ||
              hasUnsavedChanges ||
              selectedDevelopmentTargets.length === 0
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
            Seterusnya
          <ArrowRight size={16} />
        </button>
        </div>
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
