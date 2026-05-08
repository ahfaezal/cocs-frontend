const cspSections = [
  {
    no: "prakata",
    label: "P",
    title: "Prakata",
  },
  {
    no: "abbreviation",
    label: "AB",
    title: "Abbreviation",
  },
  {
    no: "glossary",
    label: "G",
    title: "Glossary",
  },
  {
    no: "figures",
    label: "F",
    title: "List of Figure",
  },
  {
    no: "acknowledgement",
    label: "A",
    title: "Acknowledgement",
  },
  {
    no: "1",
    title: "Introduction",
    active: true,
    children: [
      { no: "1.1", title: "Industry Overview" },
      { no: "1.2", title: "Occupational Definition" },
      { no: "1.3", title: "Occupational Scope" },
      { no: "1.4", title: "Working Condition" },
      { no: "1.5", title: "Employment Prospects" },
      { no: "1.6", title: "Up Skilling Opportunities" },
    ],
  },
  {
    no: "2",
    title: "COCS Development Scope",
    children: [
      { no: "2.1", title: "Rationale of COCS Development" },
      { no: "2.2", title: "Construction Occupational Structure (COS)" },
      { no: "2.3", title: "Rationale of Construction Occupational Structure" },
      {
        no: "2.4",
        title: "Regulatory/Statutory Body Requirements",
      },
      { no: "2.5", title: "Occupational Prerequisite" },
    ],
  },
  { no: "3", title: "Definition of Competency Levels" },
  { no: "4", title: "Occupational Competencies" },
  { no: "5", title: "Organisation Reference" },
  { no: "6", title: "Standard Technical Evaluation Committee" },
  { no: "7", title: "Standard Development Committee" },
];

type CSPStructureSidebarProps = {
  activeSection: string;
  onSelectSection: (sectionNo: string) => void;
};

export function CSPStructureSidebar({
  activeSection,
  onSelectSection,
}: CSPStructureSidebarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">Struktur CSP</h2>
      </div>

      <div className="space-y-2 px-4 py-4">
        {cspSections.map((section) => {
          const isActive =
            activeSection === section.no ||
            section.children?.some((child) => child.no === activeSection);

          return (
            <div
              key={section.no}
              className={`rounded-xl ${
                isActive ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectSection(section.no)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  isActive ? "text-blue-700" : "text-slate-700"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {section.label || section.no}
                </div>
                <span className="text-sm font-medium">{section.title}</span>
              </button>

              {section.children ? (
                <div className="space-y-1 pb-3 pl-14 pr-3">
                  {section.children.map((child) => {
                    const isChildActive = activeSection === child.no;

                    return (
                      <button
                        key={child.no}
                        type="button"
                        onClick={() => onSelectSection(child.no)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                          isChildActive
                            ? "bg-white text-blue-700"
                            : "text-slate-600 hover:bg-white hover:text-blue-700"
                        }`}
                      >
                        <span className="mr-2 font-bold">{child.no}</span>
                        {child.title}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
