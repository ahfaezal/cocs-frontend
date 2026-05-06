import type React from "react";

import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Network,
  Blocks,
  ClipboardList,
  BookOpen,
  GraduationCap,
  Wrench,
  Percent,
  CheckSquare,
  ShieldCheck,
  BadgeCheck,
  Files,
  BarChart3,
  Settings,
  Users,
} from "lucide-react";

import type { Permission } from "@/lib/permissions";

type SidebarMenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  permissions: Permission[];
};

type SidebarMenuSection = {
  section: string;
  title?: string;
  items: SidebarMenuItem[];
};

export const sidebarMenu: SidebarMenuSection[] = [
  {
    section: "utama",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permissions: ["project:view_all", "project:view_assigned"],
      },
      {
        label: "Projek COCS",
        href: "/projects",
        icon: FolderKanban,
        permissions: ["project:view_all", "project:view_assigned"],
      },
      {
        label: "Permohonan Projek",
        href: "/projects/new",
        icon: FileText,
        permissions: ["project:create"],
      },
    ],
  },
  {
    section: "pembangunan standard",
    title: "PEMBANGUNAN STANDARD",
    items: [
      {
        label: "Occupational Analysis (COS)",
        href: "/cos",
        icon: Network,
        permissions: ["content:view_all", "content:view_assigned"],
      },
      {
        label: "Competency Analysis (CCPC)",
        href: "/ccpc",
        icon: Blocks,
        permissions: ["content:view_all", "content:view_assigned"],
      },
      {
        label: "Competency Profile (CCP)",
        href: "/ccp",
        icon: ClipboardList,
        permissions: ["content:view_all", "content:view_assigned"],
      },
      {
        label: "Standard Practice (CSP)",
        href: "/csp",
        icon: BookOpen,
        permissions: ["content:view_all", "content:view_assigned"],
      },
      {
        label: "Curriculum (CCC)",
        href: "/ccc",
        icon: GraduationCap,
        permissions: ["content:view_all", "content:view_assigned"],
      },
      {
        label: "TEMM",
        href: "/temm",
        icon: Wrench,
        permissions: ["content:view_all", "content:view_assigned"],
      },
      {
        label: "Weightage",
        href: "/weightage",
        icon: Percent,
        permissions: ["content:view_all", "content:view_assigned"],
      },
    ],
  },
  {
    section: "semakan",
    title: "SEMAKAN & KELULUSAN",
    items: [
      {
        label: "Semakan Dalaman",
        href: "/review",
        icon: CheckSquare,
        permissions: ["review:view_assigned"],
      },
      {
        label: "JTKP",
        href: "/jtkp",
        icon: ShieldCheck,
        permissions: ["review:view_assigned"],
      },
      {
        label: "JPL",
        href: "/jpl",
        icon: BadgeCheck,
        permissions: ["review:view_assigned"],
      },
    ],
  },
  {
    section: "dokumen",
    title: "DOKUMEN & LAPORAN",
    items: [
      {
        label: "Eksport Dokumen",
        href: "/export",
        icon: Files,
        permissions: ["report:print"],
      },
      {
        label: "Laporan",
        href: "/reports",
        icon: BarChart3,
        permissions: ["report:view"],
      },
    ],
  },
  {
    section: "pentadbiran",
    title: "PENTADBIRAN",
    items: [
      {
        label: "Tetapan",
        href: "/settings",
        icon: Settings,
        permissions: ["settings:manage"],
      },
      {
        label: "Pengguna",
        href: "/users",
        icon: Users,
        permissions: ["user:manage"],
      },
    ],
  },
];
