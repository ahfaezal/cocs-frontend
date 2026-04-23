import { DacumCardItem } from "./dacum-card-item";

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

export function DacumCardGrid() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <DacumCardItem
            key={`${card.text}-${index}`}
            text={card.text}
            time={card.time}
            isNew={card.isNew}
            highlighted={card.highlighted}
          />
        ))}
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Tip: Ini paparan “raw + timestamp” sebelum grouping. Clustering CU dibuat
        selepas input panel mencukupi.
      </div>
    </div>
  );
}