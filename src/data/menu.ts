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

export const sidebarMenu = [
  {
    section: "utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Projek COCS", href: "/projects", icon: FolderKanban },
      { label: "Permohonan Projek", href: "/projects/new", icon: FileText },
    ],
  },
  {
    section: "pembangunan standard",
    title: "PEMBANGUNAN STANDARD",
    items: [
      { label: "Occupational Analysis (COS)", href: "/cos", icon: Network },
      { label: "Competency Analysis (CCPC)", href: "/ccpc", icon: Blocks },
      { label: "Competency Profile (CCP)", href: "/ccp", icon: ClipboardList },
      { label: "Standard Practice (CSP)", href: "/csp", icon: BookOpen },
      { label: "Curriculum (CCC)", href: "/ccc", icon: GraduationCap },
      { label: "TEMM", href: "/temm", icon: Wrench },
      { label: "Weightage", href: "/weightage", icon: Percent },
    ],
  },
  {
    section: "semakan",
    title: "SEMAKAN & KELULUSAN",
    items: [
      { label: "Semakan Dalaman", href: "/review", icon: CheckSquare },
      { label: "JTKP", href: "/jtkp", icon: ShieldCheck },
      { label: "JPL", href: "/jpl", icon: BadgeCheck },
    ],
  },
  {
    section: "dokumen",
    title: "DOKUMEN & LAPORAN",
    items: [
      { label: "Eksport Dokumen", href: "/export", icon: Files },
      { label: "Laporan", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    section: "pentadbiran",
    title: "PENTADBIRAN",
    items: [
      { label: "Tetapan", href: "/settings", icon: Settings },
      { label: "Pengguna", href: "/users", icon: Users },
    ],
  },
];