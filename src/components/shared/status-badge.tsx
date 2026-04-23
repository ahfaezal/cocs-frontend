import { ProjectStatus } from "@/types/project";
import {
  FileText,
  Wrench,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  BadgeCheck,
  CheckCircle,
  Archive,
  Blocks,
  GraduationCap,
} from "lucide-react";

type StatusConfig = {
  label: string;
  className: string;
  icon: any;
};

const statusMap: Record<ProjectStatus, StatusConfig> = {
  Draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700",
    icon: FileText,
  },
  "Dalam Pembangunan": {
    label: "Dalam Pembangunan",
    className: "bg-blue-100 text-blue-700",
    icon: Wrench,
  },
  "Menunggu Semakan": {
    label: "Menunggu Semakan",
    className: "bg-purple-100 text-purple-700",
    icon: Clock,
  },
  "Semakan Dalaman": {
    label: "Semakan Dalaman",
    className: "bg-yellow-100 text-yellow-700",
    icon: ClipboardCheck,
  },
  "Semakan JTKP": {
    label: "Semakan JTKP",
    className: "bg-pink-100 text-pink-700",
    icon: ShieldCheck,
  },
  "Semakan JPL": {
    label: "Semakan JPL",
    className: "bg-green-100 text-green-700",
    icon: BadgeCheck,
  },
  Lulus: {
    label: "Lulus",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
  Arkib: {
    label: "Arkib",
    className: "bg-red-100 text-red-700",
    icon: Archive,
  },
  CCPC: {
    label: "CCPC",
    className: "bg-amber-100 text-amber-700",
    icon: Blocks,
  },
  CCC: {
    label: "CCC",
    className: "bg-cyan-100 text-cyan-700",
    icon: GraduationCap,
  },
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const config = statusMap[status];

  // fallback safety (kalau data backend pelik)
  if (!config) {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        {status}
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.className} ${className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}