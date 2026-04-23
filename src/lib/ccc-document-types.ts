export interface CCCHeaderInfo {
  section: string;
  group: string;
  area: string;
  cocsTitle: string;
  competencyTitle: string;
  competencyCode: string;
  cocsLevel: string;
  trainingPrerequisite: string;
}

export interface CCCLearningOutcomeBlock {
  intro: string;
  fixedStatement: string;
  competencyUnitList: string[];
}

export interface CCCDocumentUnit {
  id: string;
  competencyUnitNumber: number;
  competencyUnitTitle: string;
  knowledgeItems: string[];
  workSteps: string[];
  attitudeItems: string[];
  safetyItems: string[];
  environmentItems: string[];
}

export interface CCCDocumentData {
  header: CCCHeaderInfo;
  learningOutcome: CCCLearningOutcomeBlock;
  units: CCCDocumentUnit[];
}