import { Bot, Clock3 } from "lucide-react";
import type {
  ActiveExecution,
  AgentStatus,
  AgentTask,
  AgentTaskId,
  Repository,
  TaskRunState
} from "../types";
import { formatRuntimeMinutes, riskLabel, statusLabel } from "../utils/format";
import { StatusPill } from "./StatusPill";

interface TaskPickerProps {
  activeExecution: ActiveExecution | null;
  executionStatus: AgentStatus;
  isAgentActive: boolean;
  liveElapsedSeconds: number;
  repository: Repository;
  selectedTaskId: AgentTaskId;
  taskRunStates: Record<string, TaskRunState>;
  tasks: AgentTask[];
  onSelectTask: (taskId: AgentTaskId) => void;
}

export function TaskPicker({
  activeExecution,
  executionStatus,
  isAgentActive,
  liveElapsedSeconds,
  repository,
  selectedTaskId,
  taskRunStates,
  tasks,
  onSelectTask
}: TaskPickerProps) {
  return (
    <div className="task-grid" role="radiogroup" aria-label="Recommended agent tasks">
      {tasks.map((task) => {
        const taskKey = `${repository.owner}/${repository.name}:${task.id}`;
        const storedState = taskRunStates[taskKey];
        const isCurrentRun =
          activeExecution?.repoOwner === repository.owner &&
          activeExecution.repoName === repository.name &&
          activeExecution.taskId === task.id;
        const isRunning = isAgentActive && isCurrentRun;
        const seconds = isRunning ? liveElapsedSeconds : storedState?.seconds ?? 0;
        const isIdle = !isRunning && !storedState;
        const runStatus: AgentStatus = isRunning
          ? "running"
          : storedState?.status ?? "idle";

        return (
          <button
            aria-checked={task.id === selectedTaskId}
            className={`task-card task-card--${runStatus} ${task.id === selectedTaskId ? "is-selected" : ""}`}
            key={task.id}
            role="radio"
            type="button"
            onClick={() => onSelectTask(task.id)}
          >
            <span className="task-card__top">
              <span className="task-icon">
                <Bot size={17} aria-hidden="true" />
              </span>
              <StatusPill compact value={isIdle ? task.risk : runStatus} />
            </span>
            <strong>{task.label}</strong>
            <span>{task.description}</span>
            <small>
              <Clock3 size={14} aria-hidden="true" />
              {formatRuntimeMinutes(seconds)} / {task.category} /{" "}
              {isIdle ? riskLabel(task.risk) : statusLabel(runStatus)}
            </small>
          </button>
        );
      })}
    </div>
  );
}
