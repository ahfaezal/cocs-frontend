"use client";

type CCPCCluster = {
  id: string | number;
  clusterName?: string;
  suggestedName?: string;
  suggestedCategory?: string;
  finalised?: boolean;
  items?: string[];
  cards?: any[];
};

type CCPCDocumentModeProps = {
  clusters: CCPCCluster[];
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

function getItems(cluster: CCPCCluster) {
  if (cluster.items && cluster.items.length > 0) return cluster.items;

  if (cluster.cards && cluster.cards.length > 0) {
    return cluster.cards.map((card) => {
      if (typeof card === "string") return card;
      return card.title || card.task || card.name || card.description || "";
    });
  }

  return [];
}

export function CCPCDocumentMode({ clusters }: CCPCDocumentModeProps) {
  const finalClusters =
    clusters.filter((cluster) => cluster.finalised).length > 0
      ? clusters.filter((cluster) => cluster.finalised)
      : clusters;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                (F) CONSTRUCTION
              </td>
            </tr>
            <tr>
              <td className="border border-black bg-[#d9d9d9] px-3 py-2">
                GROUP
              </td>
              <td className="border border-black px-3 py-2" colSpan={3}>
                (302) MANUFACTURE OF RAILWAY AND ROLLING STOCK
              </td>
            </tr>
            <tr>
              <td className="border border-black bg-[#d9d9d9] px-3 py-2">
                AREA
              </td>
              <td className="border border-black px-3 py-2" colSpan={3}>
                PERMANENT WAY (TRACKWORK)
              </td>
            </tr>
            <tr>
              <td className="border border-black bg-[#d9d9d9] px-3 py-2">
                COCS TITLE
              </td>
              <td className="border border-black px-3 py-2" colSpan={3}>
                RAILWAY
              </td>
            </tr>
            <tr>
              <td className="border border-black bg-[#d9d9d9] px-3 py-2">
                COCS LEVEL
              </td>
              <td className="border border-black px-3 py-2">ONE (1)</td>
              <td className="w-[150px] border border-black bg-[#d9d9d9] px-3 py-2">
                COCS CODE
              </td>
              <td className="border border-black px-3 py-2"></td>
            </tr>
          </tbody>
        </table>

        <div className="mb-4 grid grid-cols-[210px_1fr] gap-5">
          <div className="border border-black bg-[#d9d9d9] py-2 text-center">
            ↔CORE
            <br />
            COMPETENCY↔
          </div>

          <div className="border border-black bg-[#d9d9d9] py-2 text-center">
            ↔COMPETENCY UNIT↔
          </div>
        </div>

        <div className="space-y-5">
          {finalClusters.map((cluster, clusterIndex) => {
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
}