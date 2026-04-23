import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
  icon?: ReactNode;
};

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
  icon,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-3">
      
      {/* Breadcrumb (optional) */}
      {breadcrumb && (
        <div className="text-sm text-slate-500">
          {breadcrumb}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        
        {/* Title Section */}
        <div className="flex items-start gap-3">
          {icon && (
            <div className="mt-1 rounded-xl bg-blue-100 p-2 text-blue-700">
              {icon}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>

            {description && (
              <p className="mt-1 text-base text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Action */}
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}