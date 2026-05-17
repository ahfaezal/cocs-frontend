"use client";

type CCPCClusterCard =
  | string
  | {
      title?: string;
      task?: string;
      name?: string;
      text?: string;
      description?: string;
    };

type CCPCCluster = {
  id: string | number;
  clusterName?: string;
  suggestedName?: string;
  suggestedCategory?: string;
  finalised?: boolean;
  items?: string[];
  cards?: CCPCClusterCard[];
  target?: {
    occupationTitle?: string;
    level?: string | number;
    subarea?: string;
  };
  targetIndex?: number;
};

type CCPCDocumentModeProps = {
  clusters: CCPCCluster[];
  section?: string;
  group?: string;
  area?: string;
  cocsTitle?: string;
  cocsLevel?: string;
  cocsCode?: string;
};

function getClusterName(cluster: CCPCCluster, index: number) {
  return (
    cluster.clusterName ||
    cluster.suggestedName ||
    `COMPETENCY CLUSTER ${index + 1}`
  );
}

function getClusterCode(index: number) {
  return `CC${String(index + 1).padStart(2, "0")}`;
}

const LEVEL_LABELS: Record<string, string> = {
  "1": "ONE (1)",
  "2": "TWO (2)",
  "3": "THREE (3)",
  "4": "FOUR (4)",
  "5": "FIVE (5)",
  "6": "SIX (6)",
};

function formatLevel(level?: string) {
  const normalized = String(level || "").replace(/\D/g, "");
  return LEVEL_LABELS[normalized] || level || "-";
}

function getItems(cluster: CCPCCluster) {
  if (cluster.items && cluster.items.length > 0) return cluster.items;

  if (cluster.cards && cluster.cards.length > 0) {
    return cluster.cards.map((card) => {
      if (typeof card === "string") return card;
      return card.title || card.task || card.name || card.text || card.description || "";
    });
  }

  return [];
}

function groupClustersByTarget(clusters: CCPCCluster[]) {
  const finalClusters =
    clusters.filter((cluster) => cluster.finalised).length > 0
      ? clusters.filter((cluster) => cluster.finalised)
      : clusters;

  const groups = new Map<
    string,
    {
      title: string;
      level: string;
      subarea: string;
      clusters: CCPCCluster[];
    }
  >();

  finalClusters.forEach((cluster) => {
    const target = cluster.target || {};
    const key = `${cluster.targetIndex ?? "default"}-${target.occupationTitle || ""}-${target.level || ""}`;

    if (!groups.has(key)) {
      groups.set(key, {
        title: target.occupationTitle || "",
        level: String(target.level || ""),
        subarea: target.subarea || "",
        clusters: [],
      });
    }

    groups.get(key)?.clusters.push(cluster);
  });

  if (groups.size === 0) {
    return [
      {
        title: "",
        level: "",
        subarea: "",
        clusters: finalClusters,
      },
    ];
  }

  return Array.from(groups.values());
}

export function CCPCDocumentMode({
  clusters,
  section = "-",
  group = "-",
  area = "-",
  cocsTitle = "-",
  cocsLevel = "-",
  cocsCode = "",
}: CCPCDocumentModeProps) {
  const ccpcGroups = groupClustersByTarget(clusters);

  return (
    <div className="space-y-6">
      {ccpcGroups.map((group, groupIndex) => {
        const documentTitle = group.title || cocsTitle;
        const documentLevel = group.level || cocsLevel;
        const documentArea = group.subarea || area;

        return (
          <div
            key={`ccpc-document-${groupIndex}-${documentTitle}`}
            className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="min-w-[980px] font-serif text-[14px] text-black">
        <h1 className="mb-4 text-[16px] font-bold">
          Construction Competency Profile Chart (CCPC)
        </h1>

        <table className="mb-4 w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-[160px] border border-black bg-[#d9d9d9] px-3 py-2">
                SECTION
              </td>
              <td className="border border-black px-3 py-2" colSpan={3}>
                {section}
              </td>
            </tr>
            <tr>
              <td className="border border-black bg-[#d9d9d9] px-3 py-2">
                GROUP
              </td>
              <td className="border border-black px-3 py-2" colSpan={3}>
                {group}
              </td>
            </tr>
            <tr>
              <td className="border border-black bg-[#d9d9d9] px-3 py-2">
                AREA
              </td>
              <td className="border border-black px-3 py-2" colSpan={3}>
                {documentArea}
              </td>
            </tr>
            <tr>
              <td className="border border-black bg-[#d9d9d9] px-3 py-2">
                COCS TITLE
              </td>
              <td className="border border-black px-3 py-2" colSpan={3}>
                {documentTitle}
              </td>
            </tr>
            <tr>
              <td className="border border-black bg-[#d9d9d9] px-3 py-2">
                COCS LEVEL
              </td>
              <td className="border border-black px-3 py-2">
                {formatLevel(documentLevel)}
              </td>
              <td className="w-[150px] border border-black bg-[#d9d9d9] px-3 py-2">
                COCS CODE
              </td>
              <td className="border border-black px-3 py-2">{cocsCode}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-4 grid grid-cols-[210px_1fr] gap-5">
          <div className="border border-black bg-[#d9d9d9] py-2 text-center">
            CORE
            <br />
            COMPETENCY
          </div>

          <div className="border border-black bg-[#d9d9d9] py-2 text-center">
            COMPETENCY UNIT
          </div>
        </div>

        <div className="space-y-5">
          {group.clusters.map((cluster, clusterIndex) => {
            const clusterName = getClusterName(cluster, clusterIndex);
            const clusterCode = getClusterCode(clusterIndex);
            const items = getItems(cluster);

            return (
                <div
                    key={`cluster-${clusterIndex}-${cluster.id ?? clusterCode}`}
                    className="grid grid-cols-[210px_1fr] gap-5"
              >
                <div className="flex h-[150px] flex-col border border-black">
                  <div className="flex flex-1 items-center justify-center bg-[#d9d9d9] px-3 text-center uppercase leading-tight">
                    {clusterName}
                  </div>
                  <div className="bg-[#20a79a] py-2 text-center font-normal">
                    {clusterCode}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-5">
                  {items.length > 0 ? (
                    items.map((item, itemIndex) => (
                      <div
                        key={`${cluster.id}-${itemIndex}`}
                        className="flex h-[150px] flex-col border border-black"
                      >
                        <div className="flex flex-1 items-center justify-center px-3 text-center uppercase leading-tight">
                          {item}
                        </div>
                        <div className="border-t border-black py-2 text-center">
                          {clusterCode}- WA
                          {String(itemIndex + 1).padStart(2, "0")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-[150px] flex-col border border-black">
                      <div className="flex flex-1 items-center justify-center px-3 text-center uppercase leading-tight text-slate-400">
                        NO WORK ACTIVITY
                      </div>
                      <div className="border-t border-black py-2 text-center">
                        {clusterCode}- WA01
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
          </div>
        );
      })}
    </div>
  );
}
