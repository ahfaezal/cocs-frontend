export type ProjectStatus =
  | "draft"
  | "Draft"
  | "Dalam Pembangunan"
  | "Menunggu Semakan"
  | "Semakan Dalaman"
  | "Semakan JTKP"
  | "Semakan JPL"
  | "Lulus"
  | "Arkib"
  | "CCPC"
  | "CCC";

export type ProjectItem = {
  id: number | string;
  kodProjek: string;
  tajukProjek: string;
  bidangTred: string;
  tahap: number | string;
  jenis: "Baharu" | "Baru" | "Review" | "Kaji Semula" | string;
  status: ProjectStatus;
  progress: number;
  tarikhCipta: string;
  kemaskiniTerakhir?: string;

  sector?: string;
  sectorName?: string;
  subsector?: string;
  subsectorName?: string;
  area?: string;
  subarea?: string;
};
