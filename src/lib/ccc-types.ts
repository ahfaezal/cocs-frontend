export type DeliveryMethod =
  | "Lecture"
  | "Demonstration"
  | "Practical"
  | "Discussion"
  | "Simulation"
  | "Coaching";

export type AssessmentMethod =
  | "Observation"
  | "Oral Questioning"
  | "Written Test"
  | "Practical Test"
  | "Portfolio"
  | "Checklist";

export interface CCCAISuggested {
  learningOutcomes?: string[];
  knowledgeItems?: string[];
  attitudeItems?: string[];
  safetyItems?: string[];
  environmentItems?: string[];
  assessmentMethods?: AssessmentMethod[];
  trainingHours?: number;
}

export interface CCCItem {
  id: string;

  competencyId: string;
  competencyTitle: string;

  cuId: string;
  cuTitle: string;

  workStepId: string;
  workStepTitle: string;

  performanceCriteriaIds: string[];
  performanceCriteriaTexts: string[];

  learningOutcomes: string[];
  trainingHours: number;
  deliveryMethods: DeliveryMethod[];
  assessmentMethods: AssessmentMethod[];

  aiSuggested?: CCCAISuggested;
}