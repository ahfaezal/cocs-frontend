import type { UserRole } from "@/lib/permissions";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
};

export const currentUser: CurrentUser = {
  id: 0,
  name: "Pengguna",
  email: "",
  role: "FACILITATOR",
  organization: "CIDB Malaysia",
};

export function buildUserProjectPath(user: CurrentUser) {
  if (user.role === "SUPER_ADMIN" || user.role === "CIDB_ADMIN") {
    return "/projects/";
  }

  return `/projects/?user_id=${user.id}&role=${user.role}`;
}

