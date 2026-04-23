import { CCPCPreviewCard } from "./ccpc-preview-card";

const previewData = [
  {
    code: "C01",
    title: "Pengurusan Operasi Harian Masjid",
    category: "Core" as const,
    statement:
      "Mengurus dan menyelaras operasi harian masjid bagi memastikan perjalanan aktiviti asas, ibadah, dan fungsi pentadbiran berjalan lancar.",
    cus: [
      { code: "C01-CU01", title: "Rancang operasi harian masjid" },
      { code: "C01-CU02", title: "Laksana tugasan operasi asas masjid" },
      { code: "C01-CU03", title: "Pantau kelancaran operasi harian" },
    ],
  },
  {
    code: "C02",
    title: "Pentadbiran & Rekod Rasmi",
    category: "Core" as const,
    statement:
      "Mengurus dokumen, surat-menyurat, dan rekod rasmi masjid secara sistematik mengikut keperluan pentadbiran semasa.",
    cus: [
      { code: "C02-CU01", title: "Urus dokumen dan rekod rasmi" },
      { code: "C02-CU02", title: "Sediakan dokumentasi aktiviti masjid" },
    ],
  },
  {
    code: "E01",
    title: "Pengendalian Program & Dakwah",
    category: "Elective" as const,
    statement:
      "Mengurus pelaksanaan program dakwah, ceramah, dan aktiviti khas masjid mengikut keperluan organisasi dan komuniti.",
    cus: [
      { code: "E01-CU01", title: "Rancang program dakwah masjid" },
      { code: "E01-CU02", title: "Selaras pelaksanaan program khas" },
    ],
  },
];

export function CCPCPreviewList() {
  return (
    <div className="space-y-5">
      {previewData.map((item) => (
        <CCPCPreviewCard
          key={item.code}
          code={item.code}
          title={item.title}
          category={item.category}
          statement={item.statement}
          cus={item.cus}
        />
      ))}
    </div>
  );
}