"use client";

import { CCCDocumentData } from "@/lib/ccc-document-types";

interface CCCDocumentViewProps {
  document: CCCDocumentData | null;
}

function renderNumberedLines(items: string[]) {
  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <span className="min-w-[20px]">{index + 1}.</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function renderBulletedLines(items: string[]) {
  return (
    <ul className="ml-5 list-disc space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function CCCDocumentView({ document }: CCCDocumentViewProps) {
  if (!document) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Tiada data dokumen CCC untuk dipaparkan.
        </p>
      </div>
    );
  }

  const { header, learningOutcome, units } = document;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-slate-800">
          Construction Competency Curriculum (CCC)
        </h2>
      </div>

      <div className="overflow-x-auto px-4 py-4">
        {/* Header Table */}
        <table className="w-full border-collapse border border-slate-400 text-sm text-slate-800">
          <tbody>
            <tr>
              <td className="w-[28%] border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                SECTION
              </td>
              <td className="border border-slate-400 px-3 py-2" colSpan={3}>
                {header.section}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                GROUP
              </td>
              <td className="border border-slate-400 px-3 py-2" colSpan={3}>
                {header.group}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                AREA
              </td>
              <td className="border border-slate-400 px-3 py-2" colSpan={3}>
                {header.area}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                COCS TITLE
              </td>
              <td className="border border-slate-400 px-3 py-2" colSpan={3}>
                {header.cocsTitle}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                COMPETENCY TITLE
              </td>
              <td className="border border-slate-400 px-3 py-2" colSpan={3}>
                {header.competencyTitle}
              </td>
            </tr>
            <tr>
              <td className="align-top border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                LEARNING OUTCOMES
              </td>
              <td className="border border-slate-400 px-3 py-2" colSpan={3}>
                <div className="space-y-4">
                  <p>{learningOutcome.intro}</p>

                  <p>{learningOutcome.fixedStatement}</p>

                  {renderNumberedLines(learningOutcome.competencyUnitList)}
                </div>
              </td>
            </tr>
            <tr>
              <td className="align-top border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                TRAINING PREREQUISITE (SPECIFIC)
              </td>
              <td className="border border-slate-400 px-3 py-2" colSpan={3}>
                {header.trainingPrerequisite}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                COMPETENCY CODE
              </td>
              <td className="border border-slate-400 px-3 py-2">
                {header.competencyCode}
              </td>
              <td className="border border-slate-400 bg-slate-100 px-3 py-2 font-semibold">
                COCS LEVEL
              </td>
              <td className="border border-slate-400 px-3 py-2">
                {header.cocsLevel}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Units Table */}
        <table className="mt-6 w-full border-collapse border border-slate-400 text-sm text-slate-800">
          <thead>
            <tr className="bg-slate-100">
              <th className="w-[25%] border border-slate-400 px-3 py-3 text-left font-semibold">
                COMPETENCY UNIT
              </th>
              <th className="w-[25%] border border-slate-400 px-3 py-3 text-left font-semibold">
                KNOWLEDGE
              </th>
              <th className="w-[25%] border border-slate-400 px-3 py-3 text-left font-semibold">
                WORK STEPS
              </th>
              <th className="w-[25%] border border-slate-400 px-3 py-3 text-left font-semibold">
                ATTITUDE/ SAFETY/ ENVIRONMENT
              </th>
            </tr>
          </thead>

          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="align-top">
                <td className="border border-slate-400 px-3 py-3">
                  <div className="font-medium">
                    {unit.competencyUnitNumber}. {unit.competencyUnitTitle}
                  </div>
                </td>

                <td className="border border-slate-400 px-3 py-3">
                  {renderBulletedLines(unit.knowledgeItems)}
                </td>

                <td className="border border-slate-400 px-3 py-3">
                  {renderNumberedLines(unit.workSteps)}
                </td>

                <td className="border border-slate-400 px-3 py-3">
                  <div className="space-y-4">
                    <div>
                      <p className="mb-1 font-semibold underline">ATTITUDE</p>
                      {renderNumberedLines(unit.attitudeItems)}
                    </div>

                    <div>
                      <p className="mb-1 font-semibold underline">SAFETY</p>
                      {renderNumberedLines(unit.safetyItems)}
                    </div>

                    <div>
                      <p className="mb-1 font-semibold underline">ENVIRONMENT</p>
                      {renderNumberedLines(unit.environmentItems)}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}