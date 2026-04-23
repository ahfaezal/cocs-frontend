import { CCCItem } from "./ccc-types";

export interface CCPPerformanceCriteria {
  id: string;
  text: string;
}

export interface CCPWorkStep {
  id: string;
  title: string;
  performanceCriteria: CCPPerformanceCriteria[];
}

export interface CCPCU {
  id: string;
  title: string;
  workSteps: CCPWorkStep[];
}

export interface CCPCompetency {
  id: string;
  title: string;
  competencyUnit: CCPCU[];
}

export function mapCCPToCCC(ccpData: CCPCompetency[]): CCCItem[] {
  if (!ccpData || ccpData.length === 0) return [];

  const items: CCCItem[] = [];

  ccpData.forEach((competency) => {
    competency.competencyUnit?.forEach((cu) => {
      cu.workSteps?.forEach((workStep) => {
        items.push({
          id: `ccc-${competency.id}-${cu.id}-${workStep.id}`,
          competencyId: competency.id,
          competencyTitle: competency.title,
          cuId: cu.id,
          cuTitle: cu.title,
          workStepId: workStep.id,
          workStepTitle: workStep.title,
          performanceCriteriaIds: workStep.performanceCriteria?.map((pc) => pc.id) || [],
          performanceCriteriaTexts:
            workStep.performanceCriteria?.map((pc) => pc.text) || [],
          learningOutcomes: [""],
          trainingHours: 1,
          deliveryMethods: ["Practical"],
          assessmentMethods: ["Observation"],
          aiSuggested: {},
        });
      });
    });
  });

  return items;
}