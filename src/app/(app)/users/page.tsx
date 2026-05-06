"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  UserPlus,
  Search,
  Pencil,
  Power,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { API_URL } from "@/lib/env";
import { hasPermission, ROLE_LABELS, type UserRole } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";

type UserStatus = "ACTIVE" | "INACTIVE";

type ManagedUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  status: UserStatus;
  assignedProjects: string[];
};

type ProjectOption = {
  id: number;
  project_code?: string;
  title?: string;
};

const roleOptions: UserRole[] = [
  "SUPER_ADMIN",
  "CIDB_ADMIN",
  "PROJECT_MANAGER",
  "FACILITATOR",
  "ASSESSOR",
];

const assignableRoles: UserRole[] = [
  "PROJECT_MANAGER",
  "FACILITATOR",
  "ASSESSOR",
];

function needsProjectAssignment(role: UserRole) {
  return assignableRoles.includes(role);
}

export default function UsersPage() {
  const currentUser = useCurrentUser();
  const canManageUsers = hasPermission(currentUser.role, "user:manage");

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "FACILITATOR" as UserRole,
    organization: "CIDB Malaysia",
    assignedProjectId: "",
  });

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      const roleLabel = ROLE_LABELS[user.role].toLowerCase();

      return (
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        roleLabel.includes(keyword) ||
        user.organization.toLowerCase().includes(keyword) ||
        user.assignedProjects.join(", ").toLowerCase().includes(keyword)
      );
    });
  }, [search, users]);

  async function loadProjects() {
    const res = await fetch(`${API_URL}/projects/`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Gagal mendapatkan senarai projek.");
    }

    const data = await res.json();
    const list = Array.isArray(data) ? data : [];

    setProjects(
      list.map((project) => ({
        id: project.id,
        project_code: project.project_code,
        title: project.title,
      }))
    );
  }

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      setErrorMessage("");

      const [usersRes, assignmentsRes] = await Promise.all([
        fetch(`${API_URL}/users/`, { cache: "no-store" }),
        fetch(`${API_URL}/project-assignments/`, { cache: "no-store" }),
      ]);

      if (!usersRes.ok) {
        throw new Error("Gagal mendapatkan senarai pengguna.");
      }

      if (!assignmentsRes.ok) {
        throw new Error("Gagal mendapatkan senarai tugasan projek.");
      }

      const usersData = await usersRes.json();
      const assignmentsData = await assignmentsRes.json();

      const userList = Array.isArray(usersData) ? usersData : [];
      const assignmentList = Array.isArray(assignmentsData)
        ? assignmentsData
        : [];

      setUsers(
        userList.map((user) => {
          const assignedProjectTitles = assignmentList
            .filter((assignment) => assignment.user_id === user.id)
            .map((assignment) => {
              const project = projects.find(
                (item) => item.id === assignment.project_id
              );

              if (!project) return `Project ID ${assignment.project_id}`;

              return `${project.project_code || `COCS-${project.id}`} - ${
                project.title || "Untitled Project"
              }`;
            });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization || "CIDB Malaysia",
            status: user.status || "ACTIVE",
            assignedProjects: assignedProjectTitles,
          };
        })
      );
    } catch (error) {
      console.error("Gagal load users:", error);
      setErrorMessage("Sambungan ke backend gagal. Sila semak API pengguna.");
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (!canManageUsers) return;

    async function loadInitialData() {
      try {
        setErrorMessage("");
        await loadProjects();
      } catch (error) {
        console.error("Gagal load projects:", error);
        setErrorMessage("Sambungan ke backend gagal. Sila semak API projek.");
      }
    }

    loadInitialData();
  }, [canManageUsers]);

  useEffect(() => {
    if (canManageUsers) {
      loadUsers();
    }
  }, [canManageUsers, projects]);

  function updateForm(name: keyof typeof form, value: string) {
    setForm((prev) => {
      if (name === "role") {
        return {
          ...prev,
          role: value as UserRole,
          assignedProjectId: needsProjectAssignment(value as UserRole)
            ? prev.assignedProjectId
            : "",
        };
      }

      return { ...prev, [name]: value };
    });
  }

  async function handleAddUser() {
    const roleNeedsAssignment = needsProjectAssignment(form.role);

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Sila masukkan nama, emel dan password pengguna.");
      return;
    }

    if (roleNeedsAssignment && !form.assignedProjectId) {
      alert("Sila pilih tajuk projek untuk role ini.");
      return;
    }

    try {
      setErrorMessage("");

      const userRes = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          username: form.email.trim(),
          password: form.password,
          role: form.role,
          organization: form.organization.trim() || "CIDB Malaysia",
          status: "ACTIVE",
        }),
      });

      if (!userRes.ok) {
        const text = await userRes.text();

        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.detail || text);
        } catch {
          throw new Error(text || "Gagal tambah pengguna.");
        }
      }

      const createdUser = await userRes.json();

      if (roleNeedsAssignment) {
        const assignmentRes = await fetch(`${API_URL}/project-assignments/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: Number(form.assignedProjectId),
            user_id: createdUser.id,
            assignment_role: form.role,
            status: "ACTIVE",
          }),
        });

        if (!assignmentRes.ok) {
          const text = await assignmentRes.text();

          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.detail || text);
          } catch {
            throw new Error(text || "Gagal tambah tugasan projek.");
          }
        }
      }

      setForm({
        name: "",
        email: "",
        password: "",
        role: "FACILITATOR",
        organization: "CIDB Malaysia",
        assignedProjectId: "",
      });

      await loadUsers();
    } catch (error) {
      console.error("Gagal tambah user:", error);

      const message =
        error instanceof Error ? error.message : "Gagal tambah pengguna.";

      alert(message);
    }
  }

  async function toggleStatus(userId: number) {
    const user = users.find((item) => item.id === userId);

    if (!user) return;

    const nextStatus: UserStatus =
      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal kemaskini status pengguna.");
      }

      await loadUsers();
    } catch (error) {
      console.error("Gagal update user status:", error);
      alert("Gagal kemaskini status pengguna.");
    }
  }

  if (!canManageUsers) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-700">
        Anda tidak mempunyai kebenaran untuk mengurus pengguna.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengguna"
        description="Urus akaun pengguna, peranan sistem, dan tugasan projek."
        icon={<Shield size={20} />}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Pengguna
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tetapkan role dan projek/tajuk yang berkaitan.
            </p>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nama
              </label>
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Contoh: Fasilitator 1"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Emel / ID Login
              </label>
              <input
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="nama@cidb.gov.my"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password Sementara
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateForm("password", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Masukkan password sementara"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role
              </label>
              <select
                value={form.role}
                onChange={(event) =>
                  updateForm("role", event.target.value as UserRole)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Organisasi
              </label>
              <input
                value={form.organization}
                onChange={(event) =>
                  updateForm("organization", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="CIDB Malaysia"
              />
            </div>

            {needsProjectAssignment(form.role) ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tajuk Projek Ditugaskan
                </label>
                <select
                  value={form.assignedProjectId}
                  onChange={(event) =>
                    updateForm("assignedProjectId", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Sila pilih tajuk projek</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_code || `COCS-${project.id}`} -{" "}
                      {project.title || "Untitled Project"}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleAddUser}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <UserPlus size={18} />
              Tambah Pengguna
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Senarai Pengguna
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredUsers.length} pengguna dipaparkan.
              </p>
            </div>

            <div className="relative w-full max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Cari nama, emel atau role..."
              />
            </div>
          </div>

          {errorMessage ? (
            <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {loadingUsers ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">
              Memuatkan senarai pengguna...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nama</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Organisasi</th>
                    <th className="px-4 py-3 font-semibold">Projek/Tajuk</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Tindakan
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {user.email}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {ROLE_LABELS[user.role]}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {user.organization}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {user.assignedProjects.length > 0
                          ? user.assignedProjects.join(", ")
                          : "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {user.status === "ACTIVE" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {user.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                            title="Kemaskini pengguna"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStatus(user.id)}
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                            title={
                              user.status === "ACTIVE"
                                ? "Nyahaktif pengguna"
                                : "Aktifkan pengguna"
                            }
                          >
                            <Power size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        Tiada pengguna dijumpai.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
