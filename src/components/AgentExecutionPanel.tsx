import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RotateCcw,
  TerminalSquare
} from "lucide-react";
import type { ActiveExecution, AgentLog, AgentStatus } from "../types";
import { formatLogTime, statusLabel } from "../utils/format";
import { StatusPill } from "./StatusPill";

interface AgentExecutionPanelProps {
  activeExecution: ActiveExecution | null;
  canRetry: boolean;
  currentStep: string;
  logs: AgentLog[];
  progress: number;
  status: AgentStatus;
  onOpenDetails: () => void;
  onRetry: () => void;
}

function StatusIcon({ status }: { status: AgentStatus }) {
  if (status === "success") {
    return <CheckCircle2 size={20} aria-hidden="true" />;
  }

  if (status === "failure") {
    return <AlertTriangle size={20} aria-hidden="true" />;
  }

  if (status === "pending" || status === "running") {
    return <Loader2 className="spin" size={20} aria-hidden="true" />;
  }

  return <Clock3 size={20} aria-hidden="true" />;
}

export function AgentExecutionPanel({
  activeExecution,
  canRetry,
  currentStep,
  logs,
  progress,
  status,
  onOpenDetails,
  onRetry
}: AgentExecutionPanelProps) {
  const hasRun = Boolean(activeExecution);

  return (
    <aside className="execution-pane" aria-label="Agent execution panel">
      <div className="execution-header">
        <div>
          <p className="eyebrow">Agent execution</p>
          <h2>Live run console</h2>
        </div>
        <StatusPill value={status} />
      </div>

      <div className={`execution-status execution-status--${status}`} aria-live="polite">
        <StatusIcon status={status} />
        <div>
          <strong>{statusLabel(status)}</strong>
          <span>{currentStep}</span>
        </div>
      </div>

      <div className="progress-block" aria-label={`Execution progress ${progress}%`}>
        <span>
          <strong>{progress}%</strong>
          {activeExecution ? activeExecution.taskLabel : "No task selected"}
        </span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="run-summary">
        <span>
          <TerminalSquare size={16} aria-hidden="true" />
          {activeExecution
            ? `${activeExecution.repoOwner}/${activeExecution.repoName}`
            : "Awaiting agent run"}
        </span>
        <span>Attempt {activeExecution?.attempt ?? 0}</span>
      </div>

      {status === "failure" && activeExecution ? (
        <section className="failure-panel" aria-labelledby="failure-heading">
          <div className="failure-panel__icon">
            <AlertTriangle size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Failure review</p>
            <h3 id="failure-heading">Run stopped before changes</h3>
            <p>{activeExecution.summary}</p>
            <button className="failure-panel__retry" type="button" onClick={onRetry}>
              <RotateCcw size={15} aria-hidden="true" />
              Retry failed run
            </button>
          </div>
        </section>
      ) : null}

      <div className="log-panel" aria-label="Streaming logs">
        <div className="log-panel__header">
          <span className="console-title">
            <span className="console-window-controls" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            agent-runtime
          </span>
          <span className="console-event-count">{logs.length} events</span>
        </div>

        <div className="log-list">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div className={`log-row log-row--${log.level}`} key={log.id}>
                <time>{formatLogTime(log.timestamp)}</time>
                <span>{log.level}</span>
                <p>{log.message}</p>
              </div>
            ))
          ) : (
            <div className="empty-log-state">
              <TerminalSquare size={22} aria-hidden="true" />
              <strong>No logs yet</strong>
              <span>Start an agent task to stream execution events.</span>
            </div>
          )}
        </div>
      </div>

      <div className="execution-actions">
        <button className="secondary-action" disabled={!hasRun} type="button" onClick={onOpenDetails}>
          <FileText size={16} aria-hidden="true" />
          Details
        </button>
        <button className="secondary-action" disabled={!canRetry} type="button" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden="true" />
          Retry
        </button>
      </div>
    </aside>
  );
}
