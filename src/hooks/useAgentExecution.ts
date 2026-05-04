import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActiveExecution,
  AgentLog,
  AgentStatus,
  AgentTask,
  ExecutionAction,
  ExecutionArtifact,
  ExecutionWorkflowAction,
  LogLevel,
  Repository
} from "../types";

const LOG_INTERVAL_MS = 760;
const DEFAULT_EXECUTION_PROFILE: NonNullable<Repository["executionProfile"]> = {
  estimatedFiles: 640,
  runtime: "Repository validation",
  suites: ["workspace restore", "dependency graph", "quality checks", "artifact summary"]
};

interface LastRun {
  repo: Repository;
  task: AgentTask;
  attempt: number;
}

interface ScriptLine {
  level: LogLevel;
  message: string;
  step: string;
}

function createRunId(repo: Repository, task: AgentTask) {
  return `${repo.name}-${task.id}-${Date.now().toString(36)}`;
}

function buildMandatoryActions(repo: Repository, task: AgentTask, didFail: boolean): ExecutionAction[] {
  const forkName = `agent-fork/${repo.owner}/${repo.name}`;
  const branchName = `agent/${task.id}/${repo.name}`;

  return [
    {
      label: "Fork repository",
      status: "completed",
      value: `${forkName} prepared from ${repo.defaultBranch}`
    },
    {
      label: "View dependencies",
      status: "completed",
      value: `${repo.dependenciesOutdated} outdated dependencies, ${repo.vulnerabilities} vulnerability markers reviewed`
    },
    {
      label: "High-level scan",
      status: didFail ? "blocked" : "completed",
      value: didFail
        ? repo.executionProfile?.failureReason ?? "Repository scan stopped at policy gate"
        : `${repo.executionProfile?.runtime ?? DEFAULT_EXECUTION_PROFILE.runtime} completed across ${(repo.executionProfile?.estimatedFiles ?? DEFAULT_EXECUTION_PROFILE.estimatedFiles).toLocaleString()} files or records`
    },
    {
      label: "Create PR request",
      status: didFail ? "blocked" : "completed",
      value: didFail
        ? "PR request blocked until retry completes the scan"
        : `Draft PR request prepared from ${branchName}`
    }
  ];
}

function buildWorkflowActions(repo: Repository, task: AgentTask, didFail: boolean): ExecutionWorkflowAction[] {
  const branchName = `agent/${task.id}/${repo.name}`;
  const prPath = `/${repo.owner}/${repo.name}/pull/agent-${task.id}-${repo.name}`;
  const dependencyDetail = `${repo.dependenciesOutdated} outdated dependencies and ${repo.vulnerabilities} security markers reviewed`;

  return [
    {
      label: "Create PR",
      status: didFail ? "blocked" : "completed",
      summary: didFail ? "Draft PR request paused" : "Draft PR request prepared",
      detail: didFail
        ? "The branch remains in the prepared fork until retry completes validation."
        : `${prPath} prepared from ${branchName} with implementation notes and validation summary.`
    },
    {
      label: "Refactor code",
      status: didFail ? "blocked" : "completed",
      summary: didFail ? "Refactor candidate captured only" : "Refactor candidate planned",
      detail: didFail
        ? "The agent captured duplicated or risky areas but did not prepare changes before the failure gate."
        : "Low-risk module cleanup identified with isolated changes and no public API impact."
    },
    {
      label: "Upgrade dependencies",
      status: didFail ? "blocked" : "completed",
      summary: didFail ? "Upgrade plan requires retry" : "Upgrade plan generated",
      detail: didFail
        ? "Dependency graph was read, but patch grouping waits for a clean retry."
        : `Compatible update groups prepared from ${dependencyDetail}.`
    },
    {
      label: "View dependencies",
      status: "completed",
      summary: "Dependency graph reviewed",
      detail: dependencyDetail
    },
    {
      label: "Run tests",
      status: didFail ? "blocked" : "completed",
      summary: didFail ? "Tests stopped at validation gate" : "Required checks completed",
      detail: didFail
        ? "Partial diagnostics were preserved for retry."
        : `${repo.testCoverage}% coverage retained across ${repo.executionProfile?.suites.join(", ") ?? DEFAULT_EXECUTION_PROFILE.suites.join(", ")}.`
    },
    {
      label: "Scan repository",
      status: didFail ? "blocked" : "completed",
      summary: didFail ? "High-level scan blocked" : "High-level scan completed",
      detail: didFail
        ? repo.executionProfile?.failureReason ?? "Scan blocked before artifact generation."
        : `Scanned ${(repo.executionProfile?.estimatedFiles ?? DEFAULT_EXECUTION_PROFILE.estimatedFiles).toLocaleString()} files or records across code, dependencies, policy, and runtime checks.`
    }
  ];
}

function buildArtifacts(repo: Repository, task: AgentTask, didFail: boolean): ExecutionArtifact[] {
  if (didFail) {
    return [
      {
        label: "Failure summary",
        value:
          repo.executionProfile?.failureReason ??
          "Policy scan blocked by two high severity findings"
      },
      { label: "Suggested owner", value: repo.owner },
      { label: "Next action", value: "Retry the run after the agent refreshes its validation workspace" }
    ];
  }

  const repositoryArtifacts: ExecutionArtifact[] = [
    { label: "Runtime", value: repo.executionProfile?.runtime ?? DEFAULT_EXECUTION_PROFILE.runtime },
    { label: "Fork", value: `agent-fork/${repo.owner}/${repo.name}` },
    { label: "PR request", value: `/${repo.owner}/${repo.name}/pull/agent-${task.id}-${repo.name}` },
    {
      label: "Dependency review",
      value: `${repo.dependenciesOutdated} outdated dependencies / ${repo.vulnerabilities} vulnerability markers`
    },
    { label: "High-level scan", value: "Repository structure, dependency graph, policy state, and task scope reviewed" },
    { label: "Refactor", value: "Low-risk cleanup plan generated for review" },
    { label: "Upgrade", value: "Dependency patch groups prepared with risk notes" },
    { label: "Tests", value: `${repo.testCoverage}% coverage retained with required checks summarized` },
    {
      label: "Repository scope",
      value: `${(repo.executionProfile?.estimatedFiles ?? DEFAULT_EXECUTION_PROFILE.estimatedFiles).toLocaleString()} files or records scanned`
    },
    { label: "Health profile", value: `${repo.status} / ${repo.successRate ?? repo.agentReadiness}% success rate` }
  ];

  const datasetArtifacts: ExecutionArtifact[] = repo.dataset
    ? [
        { label: "Dataset", value: repo.dataset.name },
        { label: "Dataset size", value: repo.dataset.records },
        { label: "Dataset license", value: repo.dataset.license }
      ]
    : [];

  const artifactByTask: Record<string, ExecutionArtifact[]> = {
    "create-pr": [
      { label: "Draft PR", value: `/${repo.owner}/${repo.name}/pull/preview-agentic-change` },
      { label: "Branch", value: `agent/${task.id}/${repo.name}` }
    ],
    refactor: [
      { label: "Refactor plan", value: "Extracted duplicate validation logic into shared helper" },
      { label: "Touched modules", value: "3 files queued for review" }
    ],
    "dependency-upgrade": [
      { label: "Upgrade branch", value: `agent/dependency-upgrade/${repo.name}` },
      { label: "Package set", value: `${repo.dependenciesOutdated} dependencies evaluated` }
    ],
    "run-tests": [
      { label: "Test report", value: `${repo.testCoverage}% coverage retained` },
      { label: "Suites", value: "Unit, integration, and smoke suites completed" }
    ],
    "security-scan": [
      { label: "Scan report", value: "No blocking policy exceptions after retry" },
      { label: "Advisories reviewed", value: `${repo.vulnerabilities} findings categorized` }
    ]
  };

  return [...repositoryArtifacts, ...datasetArtifacts, ...(artifactByTask[task.id] ?? [])];
}

function buildScript(repo: Repository, task: AgentTask, didFail: boolean): ScriptLine[] {
  const executionProfile = repo.executionProfile ?? DEFAULT_EXECUTION_PROFILE;
  const suiteList = executionProfile.suites.join(", ");
  const datasetScript: ScriptLine[] = repo.dataset
    ? [
        {
          level: "info",
          step: "Validating dataset",
          message: `Validated ${repo.dataset.records} from ${repo.dataset.source}.`
        },
        {
          level: didFail ? "error" : "success",
          step: "Dataset quality gate",
          message: didFail
            ? executionProfile.failureReason ??
              "Dataset validation stopped before model artifacts were produced."
            : "Dataset schema, row counts, missing-value profile, and baseline checks passed."
        }
      ]
    : [];
  const sharedStart: ScriptLine[] = [
    {
      level: "info",
      step: "Queued",
      message: `Queued ${task.label.toLowerCase()} for ${repo.owner}/${repo.name}.`
    },
    {
      level: "info",
      step: "Reading repository",
      message: `Loaded ${repo.defaultBranch} branch metadata, CI state, and dependency manifest.`
    },
    {
      level: "success",
      step: "Fork repository",
      message: `Prepared working fork agent-fork/${repo.owner}/${repo.name} from ${repo.defaultBranch}.`
    },
    {
      level: "info",
      step: "Create PR",
      message: `Reserved draft PR request path /${repo.owner}/${repo.name}/pull/agent-${task.id}-${repo.name}.`
    },
    {
      level: "info",
      step: "Preparing backend run",
      message: `${executionProfile.runtime} started across ${executionProfile.estimatedFiles.toLocaleString()} files or records.`
    },
    {
      level: "info",
      step: "View dependencies",
      message: `Reviewed dependency graph: ${repo.dependenciesOutdated} outdated dependencies and ${repo.vulnerabilities} vulnerability markers.`
    },
    {
      level: didFail ? "warning" : "success",
      step: "Upgrade dependencies",
      message: didFail
        ? "Dependency upgrade plan was captured but waits for retry before branch updates."
        : "Grouped dependency upgrades by compatibility, risk, and validation coverage."
    },
    {
      level: didFail ? "warning" : "success",
      step: "Refactor code",
      message: didFail
        ? "Refactor candidates were recorded, but code changes are blocked until retry succeeds."
        : "Prepared low-risk refactor notes with affected modules and rollback guidance."
    },
    {
      level: didFail ? "warning" : "success",
      step: "High-level scan",
      message: didFail
        ? "High-level scan is running with known risk and may stop before PR creation."
        : "High-level repository scan completed across code, dependencies, policies, and task scope."
    },
    {
      level: "info",
      step: "Planning checks",
      message: `Execution suites queued: ${suiteList}.`
    },
    {
      level: repo.ciStatus === "failing" ? "warning" : "success",
      step: "Checking safeguards",
      message: `Guardrails checked with CI status ${repo.ciStatus} and agent readiness ${repo.agentReadiness}%.`
    }
  ];

  const taskSpecific: Record<string, ScriptLine[]> = {
    "create-pr": [
      {
        level: "info",
        step: "Planning patch",
        message: "Identified a focused change set and generated implementation notes."
      },
      {
        level: "success",
        step: "Preparing branch",
        message: "Created a draft branch with tests attached to the proposed change."
      }
    ],
    refactor: [
      {
        level: "info",
        step: "Analyzing code",
        message: "Detected repeated validation logic with low coupling and clear test coverage."
      },
      {
        level: "success",
        step: "Drafting patch",
        message: "Prepared refactor plan with no public API changes."
      }
    ],
    "dependency-upgrade": [
      {
        level: "info",
        step: "Resolving versions",
        message: `Evaluated ${repo.dependenciesOutdated} outdated packages and compatible patch ranges.`
      },
      {
        level: "success",
        step: "Creating upgrade plan",
        message: "Grouped dependency updates by risk and generated test recommendations."
      }
    ],
    "run-tests": [
      {
        level: "info",
        step: "Running suites",
        message: "Started unit, integration, and smoke test jobs in parallel."
      },
      ...datasetScript,
      {
        level: didFail ? "warning" : repo.ciStatus === "failing" ? "warning" : "success",
        step: "Collecting results",
        message: didFail
          ? "Collected partial results and preserved diagnostics for retry."
          : repo.ciStatus === "failing"
            ? "Detected existing failing checks and isolated failures to known contracts."
            : "All required suites completed inside the expected runtime."
      }
    ],
    "security-scan": [
      {
        level: "info",
        step: "Scanning dependencies",
        message: `Reviewed dependency graph with ${repo.vulnerabilities} known vulnerability markers.`
      },
      {
        level: didFail ? "error" : "success",
        step: "Evaluating policy",
        message: didFail
          ? "Policy evaluation found blocking high severity findings that require owner review."
          : "Policy evaluation completed with no blocking exceptions."
      }
    ]
  };

  const conclusion: ScriptLine = didFail
    ? {
        level: "error",
        step: "Failed",
        message: "Agent stopped before PR request creation. Retry will resume from the prepared fork."
      }
    : {
        level: "success",
        step: "Create PR request",
        message: `${task.label} completed and draft PR request is ready for review.`
      };

  return [...sharedStart, ...(taskSpecific[task.id] ?? []), conclusion];
}

export function useAgentExecution() {
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("No active run");
  const [activeExecution, setActiveExecution] = useState<ActiveExecution | null>(null);
  const timersRef = useRef<number[]>([]);
  const lastRunRef = useRef<LastRun | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  const startRun = useCallback(
    (repo: Repository, task: AgentTask, attempt: number) => {
      clearTimers();

      const didFail =
        attempt === 1 &&
        (Boolean(repo.executionProfile?.failFirstAttempt) ||
          (task.id === "security-scan" && repo.status === "critical"));
      const script = buildScript(repo, task, didFail);
      const mandatoryActions = buildMandatoryActions(repo, task, didFail);
      const workflowActions = buildWorkflowActions(repo, task, didFail);
      const runId = createRunId(repo, task);
      const startedAt = new Date().toISOString();

      lastRunRef.current = { repo, task, attempt };
      setStatus("pending");
      setLogs([]);
      setProgress(5);
      setCurrentStep("Queued");
      setActiveExecution({
        runId,
        repoName: repo.name,
        repoOwner: repo.owner,
        repoUrl: repo.url,
        dataSource: repo.dataSource,
        dataset: repo.dataset,
        taskId: task.id,
        taskLabel: task.label,
        branch: repo.defaultBranch,
        startedAt,
        attempt,
        summary: didFail
          ? "Run is expected to stop mid-execution on the first attempt so retry handling can be reviewed."
          : "Backend simulation is scanning the selected repository and preparing execution artifacts.",
        artifacts: [],
        mandatoryActions,
        workflowActions,
        runtime: repo.executionProfile?.runtime ?? DEFAULT_EXECUTION_PROFILE.runtime,
        suites: repo.executionProfile?.suites ?? DEFAULT_EXECUTION_PROFILE.suites,
        estimatedFiles: repo.executionProfile?.estimatedFiles ?? DEFAULT_EXECUTION_PROFILE.estimatedFiles
      });

      const pendingTimer = window.setTimeout(() => {
        setStatus("running");
        setCurrentStep("Initializing agent workspace");
        setProgress(12);
      }, 420);

      timersRef.current.push(pendingTimer);

      script.forEach((line, index) => {
        const timer = window.setTimeout(() => {
          setLogs((existingLogs) => [
            ...existingLogs,
            {
              id: `${runId}-${index}`,
              timestamp: new Date().toISOString(),
              level: line.level,
              message: line.message,
              step: line.step
            }
          ]);
          setCurrentStep(line.step);
          setProgress(Math.min(96, Math.round(((index + 1) / script.length) * 92)));

          if (index === script.length - 1) {
            const finishedAt = new Date().toISOString();
            const finalStatus: AgentStatus = didFail ? "failure" : "success";
            const artifacts = buildArtifacts(repo, task, didFail);
            const completedMandatoryActions = buildMandatoryActions(repo, task, didFail);
            const completedWorkflowActions = buildWorkflowActions(repo, task, didFail);

            setStatus(finalStatus);
            setProgress(100);
            setCurrentStep(didFail ? "Needs review" : "Ready for review");
            setActiveExecution((execution) =>
              execution
                ? {
                    ...execution,
                    finishedAt,
                    summary: didFail
                      ? "The agent stopped in the middle of the run. Review the diagnostics, then retry to complete the repository execution."
                      : "The agent completed the repository run successfully and generated reviewable artifacts.",
                    artifacts,
                    mandatoryActions: completedMandatoryActions,
                    workflowActions: completedWorkflowActions
                  }
                : execution
            );
          }
        }, 820 + index * LOG_INTERVAL_MS);

        timersRef.current.push(timer);
      });
    },
    [clearTimers]
  );

  const runAgent = useCallback(
    (repo: Repository, task: AgentTask) => {
      startRun(repo, task, 1);
    },
    [startRun]
  );

  const retryAgent = useCallback(() => {
    if (!lastRunRef.current) {
      return;
    }

    const { repo, task, attempt } = lastRunRef.current;
    startRun(repo, task, attempt + 1);
  }, [startRun]);

  useEffect(() => clearTimers, [clearTimers]);

  const isActive = status === "pending" || status === "running";
  const canRetry = status === "failure" && Boolean(lastRunRef.current);

  return useMemo(
    () => ({
      activeExecution,
      canRetry,
      currentStep,
      isActive,
      logs,
      progress,
      retryAgent,
      runAgent,
      status
    }),
    [activeExecution, canRetry, currentStep, isActive, logs, progress, retryAgent, runAgent, status]
  );
}
