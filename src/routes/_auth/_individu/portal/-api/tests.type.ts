export interface SaveAnswersRequest {
  answers: Array<{
    itemId: string;
    response: { keys: string[] } | null;
    responseTimeMs?: number | null;
  }>;
  revision?: number;
}

export interface SubmitSectionRequest {
  answers?: SaveAnswersRequest["answers"];
}

export interface TestCatalog {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  estimatedMinutes: number;
  totalItems: number;
  thumbnailUrl: string | null;
}

export interface TestDetailPublicResponse extends TestCatalog {
  instructions: string;
  version: string;
  totalDurationSeconds: number | null;
  pausePolicy: string;
  language: string;
  sections: Array<{
    id: string;
    code: string;
    order: number;
    name: string;
    itemCount: number;
    timeLimitSeconds: number | null;
    navigationPolicy: string;
  }>;
  myAttempt: {
    id: string;
    status: string;
  } | null;
}

export interface Attempt {
  id: string;
  testId: string;
  testCode: string;
  testName: string;
  attemptNumber: number;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED" | "EXPIRED";
  startedAt: string | null;
  completedAt: string | null;
  answeredItems: number;
  totalItems: number;
}

export interface AttemptResponse {
  id: string;
  testId: string;
  testVersion: string;
  testCode: string;
  testName: string;
  attemptNumber: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  currentSectionId: string | null;
  serverTime: string;
  sections: Array<{
    sectionId: string;
    code: string;
    order: number;
    name: string;
    itemCount: number;
    answeredCount: number;
    timeLimitSeconds: number | null;
    navigationPolicy: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED";
    startedAt: string | null;
    deadlineAt: string | null;
    completedAt: string | null;
  }>;
}

export interface SectionStartResponse {
  section: {
    id: string;
    code: string;
    name: string;
    instructions: string;
    examples: any[];
    showExamplesFirst: boolean;
    timeLimitSeconds: number | null;
    navigationPolicy: string;
    itemCount: number;
    startedAt: string | null;
    deadlineAt: string | null;
    serverTime: string;
  };
  items: Array<{
    id: string;
    number: number;
    type: string;
    content: any;
    options: any[];
    constraints: any;
    groupId: string | null;
    timeLimitSeconds: number | null;
  }>;
  answers: Array<{
    itemId: string;
    response: any;
    answeredAt: string;
  }>;
}

export interface SaveAnswersResponse {
  savedCount: number;
  revision: number;
  deadlineAt: string | null;
  serverTime: string;
}

export interface SubmitSectionResponse {
  sectionId: string;
  status: string;
  answeredCount: number;
  itemCount: number;
  nextSectionId: string | null;
  attemptStatus: string;
  serverTime: string;
}

export interface FinishAttemptResponse {
  id: string;
  status: string;
  completedAt: string;
  scoringStatus: string;
}
