import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  accent?: string;
  trend?: ReactNode;
  footer?: ReactNode;
  className?: string;
  iconWrapClassName?: string;
  valueClassName?: string;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
  trend,
  footer,
  className = "",
  iconWrapClassName = "",
  valueClassName = "",
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {icon ? (
            <div
              className={`rounded-2xl p-4 ${iconWrapClassName || accent || "bg-blue-100"}`}
            >
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-500">{title}</div>

            <div
              className={`mt-1 text-4xl font-bold tracking-tight text-slate-900 ${valueClassName}`}
            >
              {value}
            </div>

            {subtitle ? (
              <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
            ) : null}
          </div>
        </div>

        {trend ? <div className="shrink-0">{trend}</div> : null}
      </div>

      {footer ? (
        <div className="mt-4 border-t border-slate-100 pt-4">{footer}</div>
      ) : null}
    </div>
  );
}