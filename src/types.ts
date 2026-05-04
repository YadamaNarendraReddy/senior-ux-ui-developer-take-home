export type RepositoryStatus = "healthy" | "attention" | "critical";

export type RepositoryLanguage =
  | "React"
  | "Node"
  | "TypeScript"
  | "Python"
  | "Go";

export type CiStatus = "passing" | "warning" | "failing";

export type AgentTaskId =
  | "create-pr"
  | "refactor"
  | "dependency-upgrade"
  | "run-tests"
  | "security-scan";

export type AgentRisk = "low" | "medium" | "high";

export type AgentStatus = "idle" | "pending" | "running" | "success" | "failure";

export type LogLevel = "info" | "success" | "warning" | "error";

export interface RepositoryActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface RepositoryDataset {
  license: string;
  name: string;
  records: string;
  source: string;
  url: string;
}

export interface RepositoryExecutionProfile {
  estimatedFiles: number;
  failFirstAttempt?: boolean;
  failureReason?: string;
  runtime: string;
  suites: string[];
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  description: string;
  visibility: "Internal" | "Private" | "Public";
  language: RepositoryLanguage;
  framework: string;
  url?: string;
  dataSource?: string;
  dataset?: RepositoryDataset;
  defaultBranch: string;
  stars: number;
  openPrs: number;
  issues: number;
  vulnerabilities: number;
  testCoverage: number;
  lastCommit: string;
  lastRelease: string;
  contributors: number;
  dependenciesOutdated: number;
  successRate?: number;
  status: RepositoryStatus;
  ciStatus: CiStatus;
  deployStatus: "healthy" | "degraded" | "blocked";
  agentReadiness: number;
  executionProfile?: RepositoryExecutionProfile;
  insights: string[];
  recentActivity: RepositoryActivity[];
  recommendedTasks: AgentTaskId[];
}

export interface AgentTask {
  id: AgentTaskId;
  label: string;
  description: string;
  category: "Code" | "Quality" | "Security" | "Dependencies";
  estimatedMinutes: number;
  risk: AgentRisk;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  step: string;
}

export interface ExecutionArtifact {
  label: string;
  value: string;
}

export interface ExecutionAction {
  label: string;
  status: "completed" | "blocked" | "pending";
  value: string;
}

export interface ExecutionWorkflowAction {
  detail: string;
  label: string;
  status: "completed" | "blocked" | "running";
  summary: string;
}

export interface TaskRunState {
  seconds: number;
  status: "success" | "failure";
}

export interface ActiveExecution {
  runId: string;
  repoName: string;
  repoOwner: string;
  repoUrl?: string;
  dataSource?: string;
  dataset?: RepositoryDataset;
  taskId: AgentTaskId;
  taskLabel: string;
  branch: string;
  startedAt: string;
  finishedAt?: string;
  attempt: number;
  summary: string;
  artifacts: ExecutionArtifact[];
  mandatoryActions: ExecutionAction[];
  workflowActions: ExecutionWorkflowAction[];
  runtime: string;
  suites: string[];
  estimatedFiles: number;
}
