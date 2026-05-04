import {
  Activity,
  ArrowUpRight,
  Bot,
  CalendarClock,
  ChevronRight,
  Code2,
  GitPullRequest,
  Play,
  ShieldAlert,
  Star
} from "lucide-react";
import type {
  ActiveExecution,
  AgentStatus,
  AgentTask,
  AgentTaskId,
  Repository,
  RepositoryActivity,
  TaskRunState
} from "../types";
import {
  formatNumber,
  formatPercent,
  formatRuntimeMinutes,
  formatShortDate,
  riskLabel,
  statusLabel
} from "../utils/format";
import { StatusPill } from "./StatusPill";
import { TaskPicker } from "./TaskPicker";

interface RepositoryOverviewProps {
  activeExecution: ActiveExecution | null;
  executionStatus: AgentStatus;
  isAgentActive: boolean;
  liveElapsedSeconds: number;
  repository: Repository;
  selectedTaskId: AgentTaskId;
  taskRunStates: Record<string, TaskRunState>;
  tasks: AgentTask[];
  onActivityAction: (taskId: AgentTaskId) => void;
  onRunAgent: () => void;
  onSelectTask: (taskId: AgentTaskId) => void;
}

function getActivityTask(repository: Repository, activity: RepositoryActivity): AgentTaskId {
  const text = `${activity.title} ${activity.description}`.toLowerCase();
  let taskId: AgentTaskId = repository.recommendedTasks[0];

  if (text.includes("security") || text.includes("advis")) {
    taskId = "security-scan";
  } else if (text.includes("dependency") || text.includes("client")) {
    taskId = "dependency-upgrade";
  } else if (
    text.includes("ci") ||
    text.includes("test") ||
    text.includes("flake") ||
    text.includes("failed")
  ) {
    taskId = "run-tests";
  } else if (text.includes("pr") || text.includes("merged") || text.includes("branch")) {
    taskId = "create-pr";
  } else if (text.includes("duplicate") || text.includes("refactor")) {
    taskId = "refactor";
  }

  return repository.recommendedTasks.includes(taskId) ? taskId : repository.recommendedTasks[0];
}

export function RepositoryOverview({
  activeExecution,
  executionStatus,
  isAgentActive,
  liveElapsedSeconds,
  onActivityAction,
  repository,
  selectedTaskId,
  taskRunStates,
  tasks,
  onRunAgent,
  onSelectTask
}: RepositoryOverviewProps) {
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];
  const successRate = repository.successRate ?? repository.agentReadiness;
  const selectedTaskKey = `${repository.owner}/${repository.name}:${selectedTask.id}`;
  const isSelectedTaskRunning =
    isAgentActive &&
    activeExecution?.repoOwner === repository.owner &&
    activeExecution.repoName === repository.name &&
    activeExecution.taskId === selectedTask.id;
  const selectedTaskRunState = taskRunStates[selectedTaskKey];
  const selectedTaskSeconds = isSelectedTaskRunning
    ? liveElapsedSeconds
    : selectedTaskRunState?.seconds ?? 0;
  const selectedTaskStatus = isSelectedTaskRunning
    ? "running"
    : selectedTaskRunState?.status ?? "idle";
  const valueCards: Array<{
    action: AgentTaskId;
    label: string;
    value: string;
  }> = [
    { action: "create-pr", label: "Open PRs", value: formatNumber(repository.openPrs) },
    { action: "run-tests", label: "Success rate", value: formatPercent(successRate) },
    { action: "refactor", label: "Issues", value: formatNumber(repository.issues) },
    {
      action: "security-scan",
      label: "Vulnerabilities",
      value: formatNumber(repository.vulnerabilities)
    },
    { action: "run-tests", label: "Coverage", value: formatPercent(repository.testCoverage) },
    { action: "create-pr", label: "Contributors", value: formatNumber(repository.contributors) },
    {
      action: "dependency-upgrade",
      label: "Outdated dependencies",
      value: formatNumber(repository.dependenciesOutdated)
    }
  ];

  return (
    <section className="overview-pane" aria-label="Repository overview">
      <div className="repo-hero">
        <div className="repo-identity">
          <p className="eyebrow">{repository.owner}</p>
          <h2>{repository.name}</h2>
          <p>{repository.description}</p>
          <div className="repo-readiness" aria-label={`Agent readiness ${repository.agentReadiness}%`}>
            <span>
              <strong>{repository.agentReadiness}%</strong>
              Agent readiness
            </span>
            <div className="repo-readiness__track">
              <div
                className="repo-readiness__fill"
                style={{ width: `${repository.agentReadiness}%` }}
              />
            </div>
          </div>
        </div>

        <div className="repo-actions">
          <StatusPill value={repository.status} />
          <div className="hero-agent-card">
            <span>Selected agent task</span>
            <strong>{selectedTask.label}</strong>
            <small>
              {riskLabel(selectedTask.risk)} / {formatRuntimeMinutes(selectedTaskSeconds)} /{" "}
              {statusLabel(selectedTaskStatus)}
            </small>
            <button
              className="primary-action"
              disabled={isAgentActive}
              type="button"
              onClick={onRunAgent}
            >
              <Play size={16} aria-hidden="true" />
              Run Agent Task
            </button>
          </div>
        </div>
      </div>

      <div className="metadata-strip" aria-label="Repository metadata">
        <span>
          <Code2 size={16} aria-hidden="true" />
          {repository.language} / {repository.framework}
        </span>
        <span>
          <GitPullRequest size={16} aria-hidden="true" />
          {repository.openPrs} open PRs
        </span>
        <span>
          <Star size={16} aria-hidden="true" />
          {formatNumber(repository.stars)} stars
        </span>
        <span>
          <ShieldAlert size={16} aria-hidden="true" />
          {formatPercent(successRate)} success rate
        </span>
        <span>
          <Activity size={16} aria-hidden="true" />
          {repository.dataSource ?? "Mock workspace"}
        </span>
        <span>
          <CalendarClock size={16} aria-hidden="true" />
          Last commit {formatShortDate(repository.lastCommit)}
        </span>
      </div>

      <section className="repo-values-panel" aria-labelledby="repo-values-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected repository</p>
            <h3 id="repo-values-heading">Values and labels</h3>
          </div>
          <div className="section-actions">
            <StatusPill
              compact
              value={repository.visibility.toLowerCase() as "internal" | "private" | "public"}
            />
          </div>
        </div>
        <div className="repo-values-grid">
          {valueCards.map((card) => (
            <button key={card.label} type="button" onClick={() => onSelectTask(card.action)}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>Set related agent task</small>
            </button>
          ))}
        </div>
      </section>

      <div className="metric-grid" aria-label="Repository insights">
        <button className="metric-card" type="button" onClick={() => onSelectTask("run-tests")}>
          <span>CI status</span>
          <strong>{statusLabel(repository.ciStatus)}</strong>
          <small>Default branch: {repository.defaultBranch}</small>
        </button>
        <button className="metric-card" type="button" onClick={() => onSelectTask("run-tests")}>
          <span>Test coverage</span>
          <strong>{formatPercent(repository.testCoverage)}</strong>
          <small>Latest release {formatShortDate(repository.lastRelease)}</small>
        </button>
        <button className="metric-card" type="button" onClick={() => onSelectTask("run-tests")}>
          <span>Success rate</span>
          <strong>{formatPercent(successRate)}</strong>
          <small>Successful agent confidence profile</small>
        </button>
        <button className="metric-card" type="button" onClick={() => onSelectTask("security-scan")}>
          <span>Security</span>
          <strong>{repository.vulnerabilities}</strong>
          <small>Open vulnerability markers</small>
        </button>
        <button
          className="metric-card"
          type="button"
          onClick={() => onSelectTask("dependency-upgrade")}
        >
          <span>Agent readiness</span>
          <strong>{repository.agentReadiness}%</strong>
          <small>{repository.dependenciesOutdated} dependencies outdated</small>
        </button>
      </div>

      <div className="overview-grid">
        <section className="insight-panel" aria-labelledby="insights-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Insights</p>
              <h3 id="insights-heading">Repository signals</h3>
            </div>
            <Activity size={18} aria-hidden="true" />
          </div>
          <ul className="insight-list">
            {repository.insights.map((insight) => (
              <li key={insight}>
                <ChevronRight size={16} aria-hidden="true" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="activity-panel" aria-labelledby="activity-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Activity</p>
              <h3 id="activity-heading">Recent changes</h3>
            </div>
            <GitPullRequest size={18} aria-hidden="true" />
          </div>
          <div className="activity-list">
            {repository.recentActivity.map((item) => (
              <button
                className="activity-item"
                key={item.id}
                type="button"
                onClick={() => onActivityAction(getActivityTask(repository, item))}
              >
                <span className="activity-item__date">{formatShortDate(item.timestamp)}</span>
                <strong>{item.title}</strong>
                <span className="activity-item__description">{item.description}</span>
                <span className="activity-item__action">
                  Queue related task
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="task-section" aria-labelledby="task-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Agent actions</p>
            <h3 id="task-heading">Available tasks</h3>
          </div>
          <div className="task-heading-actions">
            <div className="selected-task-summary">
              <Bot size={16} aria-hidden="true" />
              <span>
                {selectedTask.label} / {riskLabel(selectedTask.risk)}
              </span>
            </div>
          </div>
        </div>

        <div className="agent-launch-panel">
          <div>
            <span>Ready to run</span>
            <strong>{selectedTask.label}</strong>
            <small>
              {selectedTask.description} Runtime from latest details:{" "}
              {formatRuntimeMinutes(selectedTaskSeconds)}.
            </small>
          </div>
        </div>

        <TaskPicker
          selectedTaskId={selectedTaskId}
          activeExecution={activeExecution}
          executionStatus={executionStatus}
          isAgentActive={isAgentActive}
          liveElapsedSeconds={liveElapsedSeconds}
          taskRunStates={taskRunStates}
          tasks={tasks}
          repository={repository}
          onSelectTask={onSelectTask}
        />
      </section>

      <div className="readiness-band">
        <ShieldAlert size={18} aria-hidden="true" />
        <span>
          {repository.deployStatus === "blocked"
            ? "Deploy gate is blocked. Agent actions will stop before applying changes if policy fails."
            : "Deploy gate is available. Agent actions are scoped to branch or review artifacts."}
        </span>
      </div>
    </section>
  );
}
