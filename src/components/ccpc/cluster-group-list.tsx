import { ClusterCard } from "./cluster-card";

const clusters = [
  {
    code: "CL-01",
    title: "Pengurusan Operasi Harian Masjid",
    count: 8,
    confidence: "92%",
    active: true,
  },
  {
    code: "CL-02",
    title: "Pentadbiran & Rekod Rasmi",
    count: 7,
    confidence: "89%",
  },
  {
    code: "CL-03",
    title: "Pengurusan Kewangan Masjid",
    count: 6,
    confidence: "91%",
  },
  {
    code: "CL-04",
    title: "Pengendalian Program & Dakwah",
    count: 9,
    confidence: "87%",
  },
  {
    code: "CL-05",
    title: "Keselamatan, Fasiliti & Sokongan",
    count: 6,
    confidence: "85%",
  },
];

export function ClusterGroupList() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">Senarai Cluster AI</h2>
      </div>

      <div className="space-y-3 px-5 py-5">
        {clusters.map((cluster) => (
          <ClusterCard
            key={cluster.code}
            code={cluster.code}
            title={cluster.title}
            count={cluster.count}
            confidence={cluster.confidence}
            active={cluster.active}
          />
        ))}
      </div>
    </div>
  );
}