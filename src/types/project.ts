export type ProjectStatus =
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
  id: string;
  kodProjek: string;
  tajukProjek: string;
  bidangTred: string;
  tahap: number;
  jenis: "Baru" | "Review";
  status: ProjectStatus;
  progress: number;
  tarikhCipta: string;
  kemaskiniTerakhir?: string;
};