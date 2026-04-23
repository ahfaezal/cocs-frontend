"use client";

import { CCCPage } from "@/components/curriculum/CCCPage";
import { useBuilderStore } from "@/stores/useBuilderStore";

const fallbackCCPData = [
  {
    id: "comp-1",
    title: "Prepare Blasting Work Area",
    competencyUnit: [
      {
        id: "cu-1",
        title: "Apply protection coverings",
        workSteps: [
          {
            id: "ws-1-1",
            title: "Identify areas requiring protective coverings",
            performanceCriteria: [
              { id: "pc-1-1", text: "Areas requiring protection are identified correctly." },
              { id: "pc-1-2", text: "Protective covering requirement is confirmed before installation." },
            ],
          },
          {
            id: "ws-1-2",
            title: "Install protective coverings",
            performanceCriteria: [
              { id: "pc-1-3", text: "Protective coverings are installed according to work requirement." },
              { id: "pc-1-4", text: "Installation is carried out using appropriate tools and materials." },
            ],
          },
          {
            id: "ws-1-3",
            title: "Inspect protective coverings",
            performanceCriteria: [
              { id: "pc-1-5", text: "Protective coverings are checked for completeness and fitting." },
              { id: "pc-1-6", text: "Defects or gaps are identified and corrected." },
            ],
          },
        ],
      },
      {
        id: "cu-2",
        title: "Coordinate safety signage and barricades",
        workSteps: [
          {
            id: "ws-2-1",
            title: "Identify signage and barricade materials",
            performanceCriteria: [
              { id: "pc-2-1", text: "Suitable signage and barricade materials are identified." },
              { id: "pc-2-2", text: "Materials selected are appropriate to hazard level and location." },
            ],
          },
          {
            id: "ws-2-2",
            title: "Install safety signage",
            performanceCriteria: [
              { id: "pc-2-3", text: "Safety signage is installed at visible and appropriate locations." },
              { id: "pc-2-4", text: "Installed signage clearly communicates hazard information." },
            ],
          },
          {
            id: "ws-2-3",
            title: "Erect safety barricades",
            performanceCriteria: [
              { id: "pc-2-5", text: "Barricades are erected securely according to worksite requirement." },
              { id: "pc-2-6", text: "Barricaded areas are clearly defined and accessible risk is controlled." },
            ],
          },
          {
            id: "ws-2-4",
            title: "Report safety hazards",
            performanceCriteria: [
              { id: "pc-2-7", text: "Hazards are reported according to reporting procedure." },
              { id: "pc-2-8", text: "Relevant personnel are informed promptly." },
            ],
          },
        ],
      },
      {
        id: "cu-3",
        title: "Setup ventilation system",
        workSteps: [
          {
            id: "ws-3-1",
            title: "Inspect ventilation equipment",
            performanceCriteria: [
              { id: "pc-3-1", text: "Ventilation equipment is inspected before installation." },
              { id: "pc-3-2", text: "Faulty components are identified and reported." },
            ],
          },
          {
            id: "ws-3-2",
            title: "Install ventilation components",
            performanceCriteria: [
              { id: "pc-3-3", text: "Ventilation components are installed according to procedure." },
              { id: "pc-3-4", text: "Airflow direction is aligned to work requirement." },
            ],
          },
          {
            id: "ws-3-3",
            title: "Test ventilation system functionality",
            performanceCriteria: [
              { id: "pc-3-5", text: "Ventilation performance is tested after installation." },
              { id: "pc-3-6", text: "System functionality meets required operating condition." },
            ],
          },
          {
            id: "ws-3-4",
            title: "Adjust ventilation direction",
            performanceCriteria: [
              { id: "pc-3-7", text: "Ventilation direction is adjusted to minimize dust spread." },
              { id: "pc-3-8", text: "Airflow is directed safely and effectively." },
            ],
          },
        ],
      },
      {
        id: "cu-4",
        title: "Ensure work zone safety",
        workSteps: [
          {
            id: "ws-4-1",
            title: "Inspect work zone",
            performanceCriteria: [
              { id: "pc-4-1", text: "Work zone is inspected before work starts." },
              { id: "pc-4-2", text: "Unsafe conditions are identified and recorded." },
            ],
          },
          {
            id: "ws-4-2",
            title: "Confirm lighting and access",
            performanceCriteria: [
              { id: "pc-4-3", text: "Lighting and access routes are confirmed as adequate." },
              { id: "pc-4-4", text: "Emergency access is not obstructed." },
            ],
          },
          {
            id: "ws-4-3",
            title: "Verify clearance from hot work",
            performanceCriteria: [
              { id: "pc-4-5", text: "Safe clearance from hot work area is verified." },
              { id: "pc-4-6", text: "Nearby materials and equipment are protected from hazards." },
            ],
          },
        ],
      },
      {
        id: "cu-5",
        title: "Maintain safety documentation",
        workSteps: [
          {
            id: "ws-5-1",
            title: "Prepare safety records",
            performanceCriteria: [
              { id: "pc-5-1", text: "Safety records are prepared according to documentation procedure." },
              { id: "pc-5-2", text: "Recorded information is accurate and complete." },
            ],
          },
          {
            id: "ws-5-2",
            title: "Update work permit information",
            performanceCriteria: [
              { id: "pc-5-3", text: "Permit information is updated according to current work status." },
              { id: "pc-5-4", text: "Permit changes are communicated to relevant personnel." },
            ],
          },
          {
            id: "ws-5-3",
            title: "File safety documentation",
            performanceCriteria: [
              { id: "pc-5-5", text: "Safety documents are filed systematically and retrievably." },
              { id: "pc-5-6", text: "Documentation is maintained in accordance with retention procedure." },
            ],
          },
        ],
      },
    ],
  },
];

const fallbackDocumentMeta = {
  section: "(F) Construction",
  group: "(259) Treatment and Coating of Metals",
  area: "Blasting & Painting Operation (Oil & Gas)",
  cocsTitle: "Blaster & Painter",
  competencyTitle: "Prepare Blasting Work Area",
  competencyCode: "XXX-C01",
  cocsLevel: "Two (2)",
  trainingPrerequisite: "Not available.",
};

export default function CCCPageRoute() {
  const { ccpData, cccData, setCCCData, cccDocumentMeta } = useBuilderStore();

  const effectiveCCPData = ccpData.length > 0 ? ccpData : fallbackCCPData;
  const effectiveMeta = cccDocumentMeta ?? fallbackDocumentMeta;

  return (
    <div className="p-6">
      <CCCPage
        ccpData={effectiveCCPData}
        value={cccData}
        onChange={setCCCData}
        documentMeta={effectiveMeta}
      />
    </div>
  );
}