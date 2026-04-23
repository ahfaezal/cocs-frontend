import { Copy, RefreshCcw, QrCode, Smartphone } from "lucide-react";

export function PanelQRCodeCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">QR Code & Panel Input</h2>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="flex justify-center">
          <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
            <div className="text-center">
              <QrCode size={42} className="mx-auto" />
              <div className="mt-3 text-sm font-medium">QR Code Session</div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Link Panel Input
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            https://cocs-cidb/panel-input/bricklaying-level-3
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <Smartphone size={18} className="mt-0.5 text-blue-700" />
            <p className="text-sm leading-6 text-slate-600">
              Panel hanya perlu scan QR dan isi satu aktiviti kerja bagi setiap
              kad. Semua maklumat projek telah disediakan oleh fasilitator.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Copy size={16} />
            Copy Link
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <RefreshCcw size={16} />
            Refresh QR
          </button>
        </div>
      </div>
    </div>
  );
}