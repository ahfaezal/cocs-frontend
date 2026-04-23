type ProgressBarProps = {
  value: number;
  showLabel?: boolean;
  size?: "sm" | "md";
};

export function ProgressBar({
  value,
  showLabel = true,
  size = "md",
}: ProgressBarProps) {
  // clamp value (0 - 100)
  const safeValue = Math.max(0, Math.min(100, value));

  // dynamic color ikut progress
  const getColor = () => {
    if (safeValue >= 90) return "bg-emerald-600";
    if (safeValue >= 70) return "bg-blue-600";
    if (safeValue >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex items-center gap-3">
      <div className={`w-28 rounded-full bg-slate-200 ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out ${getColor()}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>

      {showLabel && (
        <span className="text-sm font-medium text-slate-700">
          {safeValue}%
        </span>
      )}
    </div>
  );
}