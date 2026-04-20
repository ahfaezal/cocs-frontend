"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/src/lib/api";

type Project = {
  id: number;
  project_code: string;
  title: string;
  type: string;
  field?: string;
  level?: number;
  status?: string;
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI("/projects/")
      .then((data) => setProjects(data))
      .catch((err) => {
        console.error(err);
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalProjects = projects.length;
  const draftCount = projects.filter((p) => (p.status || "").toLowerCase() === "draft").length;
  const newCount = projects.filter((p) => (p.type || "").toLowerCase() === "new").length;
  const reviewCount = projects.filter((p) => (p.type || "").toLowerCase() === "review").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 260,
          background: "#0b1f3a",
          color: "white",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>COCS Builder</h2>
        <p style={{ marginTop: 0, color: "#b9c4d4", fontSize: 14 }}>
          Construction Occupational Competency Standards
        </p>

        <div style={{ marginTop: 32 }}>
          <NavItem label="Dashboard" active />
          <NavItem label="Projek COCS" />
          <NavItem label="Occupational Analysis (COS)" />
          <NavItem label="Competency Analysis (CCPC)" />
          <NavItem label="Competency Profile (CCP)" />
          <NavItem label="Curriculum (CCC)" />
          <NavItem label="TEMM" />
          <NavItem label="Weightage" />
          <NavItem label="Semakan Dalaman" />
          <NavItem label="Laporan" />
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32 }}>
        <h1 style={{ marginTop: 0, color: "#10233f" }}>Dashboard COCS</h1>
        <p style={{ color: "#5c6b80" }}>Ringkasan projek pembangunan COCS.</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          <StatCard title="Jumlah Projek" value={totalProjects} />
          <StatCard title="Status Draft" value={draftCount} />
          <StatCard title="Projek Baharu" value={newCount} />
          <StatCard title="Projek Review" value={reviewCount} />
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 20, color: "#10233f" }}>Senarai Projek</h2>

          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p>Tiada projek dijumpai.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f3f6fb", textAlign: "left" }}>
                    <th style={thStyle}>Kod</th>
                    <th style={thStyle}>Tajuk</th>
                    <th style={thStyle}>Bidang</th>
                    <th style={thStyle}>Tahap</th>
                    <th style={thStyle}>Jenis</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} style={{ borderTop: "1px solid #e6ebf2" }}>
                      <td style={tdStyle}>{p.project_code}</td>
                      <td style={tdStyle}>{p.title}</td>
                      <td style={tdStyle}>{p.field || "-"}</td>
                      <td style={tdStyle}>{p.level || "-"}</td>
                      <td style={tdStyle}>{p.type || "-"}</td>
                      <td style={tdStyle}>{p.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 8,
        marginBottom: 8,
        background: active ? "#1d4ed8" : "transparent",
        color: "white",
        fontSize: 14,
      }}
    >
      {label}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#5c6b80", fontSize: 14, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#10233f" }}>{value}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: 12,
  fontSize: 14,
  color: "#334155",
};

const tdStyle: React.CSSProperties = {
  padding: 12,
  fontSize: 14,
  color: "#0f172a",
};