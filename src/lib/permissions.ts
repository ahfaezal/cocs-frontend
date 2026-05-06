export type UserRole =
  | "SUPER_ADMIN"
  | "CIDB_ADMIN"
  | "PROJECT_MANAGER"
  | "FACILITATOR"
  | "ASSESSOR";

export type Permission =
  | "project:view_all"
  | "project:view_assigned"
  | "project:create"
  | "project:update_all"
  | "project:update_assigned"
  | "project:delete"
  | "content:view_all"
  | "content:view_assigned"
  | "content:create_assigned"
  | "content:update_assigned"
  | "content:delete_assigned"
  | "content:comment"
  | "review:view_assigned"
  | "review:comment"
  | "review:approve"
  | "report:view"
  | "report:print"
  | "user:manage"
  | "settings:manage";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CIDB_ADMIN: "Admin - Pegawai CIDB",
  PROJECT_MANAGER: "Admin - Project Manager",
  FACILITATOR: "Fasilitator",
  ASSESSOR: "Pegawai Penilai",
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "project:view_all",
    "project:create",
    "project:update_all",
    "project:update_assigned",
    "project:delete",

    "content:view_all",
    "content:view_assigned",
    "content:create_assigned",
    "content:update_assigned",
    "content:delete_assigned",
    "content:comment",

    "review:view_assigned",
    "review:comment",
    "review:approve",

    "report:view",
    "report:print",

    "user:manage",
    "settings:manage",
  ],

  CIDB_ADMIN: [
    "project:view_all",
    "content:view_all",
    "review:view_assigned",
    "review:comment",
    "report:view",
    "report:print",
  ],

  PROJECT_MANAGER: [
    "project:view_assigned",
    "project:create",
    "project:update_assigned",
    "content:view_assigned",
    "review:view_assigned",
    "review:comment",
    "report:view",
    "report:print",
  ],

  FACILITATOR: [
    "project:view_assigned",
    "content:view_assigned",
    "content:create_assigned",
    "content:update_assigned",
    "content:delete_assigned",
    "content:comment",
  ],

  ASSESSOR: [
    "project:view_assigned",
    "content:view_assigned",
    "review:view_assigned",
    "review:comment",
  ],
};

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function canEditProjectContent(params: {
  role: UserRole;
  userId: string | number;
  projectOwnerFacilitatorId?: string | number | null;
}) {
  if (params.role === "SUPER_ADMIN") return true;

  if (params.role === "FACILITATOR") {
    return (
      String(params.userId) === String(params.projectOwnerFacilitatorId)
    );
  }

  return false;
}
