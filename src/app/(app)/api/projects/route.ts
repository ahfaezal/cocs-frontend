import { NextResponse } from "next/server";

let projects: any[] = [
  {
    id: "1",
    projectCode: "COCS/2026/001",
    projectTitle: "Bricklayer (Wet Trade) Level 3",
    field: "Building Construction",
    trade: "Bricklaying (Wet Trade)",
    level: "3",
    status: "draft",
    progress: 0,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: projects,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newProject = {
      id: crypto.randomUUID(),
      projectCode:
        body.projectCode ||
        `COCS/${new Date().getFullYear()}/${String(projects.length + 1).padStart(3, "0")}`,
      projectTitle: body.projectTitle || body.title || "Untitled Project",
      field: body.field || body.sector || body.bidangPekerjaan || "",
      trade: body.trade || body.occupation || body.tredOccupation || "",
      level: body.level || body.targetLevel || body.tahapSasaran || "",
      status: body.status || "draft",
      progress: body.progress || 0,
      createdAt: new Date().toISOString(),
      ...body,
    };

    projects.push(newProject);

    return NextResponse.json({
      success: true,
      message: "Projek berjaya disimpan.",
      data: newProject,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan projek.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}