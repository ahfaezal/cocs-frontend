import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Monitor,
  Snowflake,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Live Board DACUM",
};

const cards = [
  { text: "Ganti imam tidak hadir", time: "14:41:48" },
  { text: "Sedia jadual tugas bilal", time: "14:41:53" },
  { text: "Kendali majlis ilmu khas", time: "14:41:58" },
  { text: "Selaras tugasan jawatankuasa", time: "14:42:04" },
  { text: "Simpan resit kewangan rasmi", time: "14:42:08" },
  { text: "Laporkan kerosakan fasiliti masjid", time: "14:42:14" },
  { text: "Sambut tetamu jemputan rasmi", time: "14:42:18" },
  { text: "Kemas kini papan kenyataan", time: "14:42:23" },

  { text: "Pantau perjalanan program masjid", time: "14:42:29" },
  { text: "Laporkan insiden keselamatan masjid", time: "14:42:38" },
  { text: "Selaras sukarelawan program masjid", time: "14:42:42" },
  { text: "Sedia laporan aktiviti tahunan", time: "14:42:48" },
  { text: "Simpan dokumentasi program masjid", time: "14:42:52" },
  { text: "Selesai isu kariah setempat", time: "14:42:57" },
  { text: "Semak keselamatan peralatan masjid", time: "14:43:02" },
  { text: "Urus penyelenggaraan fasiliti masjid", time: "14:43:06" },

  { text: "Sahkan baucar bayaran masjid", time: "14:43:10" },
  { text: "Urus surat menyurat rasmi", time: "14:43:15" },
  { text: "Sedia teks tazkirah ringkas", time: "14:43:20" },
  { text: "Semak bacaan imam bertugas", time: "14:43:31" },
  { text: "Semak sistem pembesar suara", time: "14:43:35" },
  { text: "Hebah program dakwah masjid", time: "14:43:39" },
  { text: "Kemas kini rekod pentadbiran", time: "14:43:42" },
  { text: "Urus perbelanjaan operasi masjid", time: "14:43:47" },

  { text: "Pantau sistem pendingin hawa", time: "14:43:51" },
  { text: "Sedia peralatan program masjid", time: "14:43:58" },
  { text: "Lafaz iqamah solat fardu", time: "14:44:19" },
  { text: "Pimpin bacaan wirid jemaah", time: "14:44:23" },
  { text: "Baca doa selepas solat", time: "14:44:33" },
  { text: "Sampaikan khutbah Jumaat rasmi", time: "14:44:37" },
  { text: "Laungkan azan waktu Maghrib", time: "14:44:42" },
  { text: "Jemput penceramah jemputan luar", time: "14:44:44" },

  { text: "Simpan fail dokumen masjid", time: "14:44:49" },
  { text: "Semak baki akaun masjid", time: "14:44:52" },
  { text: "Terima aduan jemaah masjid", time: "14:44:58" },
  { text: "Atur program ceramah khas", time: "14:45:30" },
  { text: "Imamkan solat sunat berjemaah", time: "14:45:34" },
  { text: "Sedia laporan kewangan bulanan", time: "14:45:39" },
  { text: "Urus maklumat ahli kariah", time: "14:45:44" },
  {
    text: "Rekod sumbangan derma harian",
    time: "14:45:58",
    isNew: true,
    highlighted: true,
  },
];

export default function CCPCProjectorLiveBoardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1800px] px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
                  <Monitor size={20} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Live Board (DACUM Card)
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Status: connected | Session: Bricklaying-Level-3 | Mode: Projector
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ccpc"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Kembali ke CCPC
              </Link>

              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <Snowflake size={16} />
                Freeze
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-medium text-purple-700 transition hover:bg-purple-50">
                <Sparkles size={16} />
                AI Cluster Preview
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                <RefreshCw size={16} />
                Full Screen
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] px-6 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => (
              <div
                key={`${card.text}-${index}`}
                className={`border border-slate-800 p-4 ${
                  card.highlighted ? "bg-amber-50" : "bg-white"
                }`}
              >
                <div className="min-h-[88px] text-[22px] font-bold leading-tight text-slate-900">
                  {card.text}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">{card.time}</span>

                  {card.isNew ? (
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase text-white">
                      Baru
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Tip: Ini paparan “raw + timestamp” sebelum grouping. Clustering dibuat selepas input mencukupi dan disahkan fasilitator.
          </div>
        </div>
      </main>
    </div>
  );
}