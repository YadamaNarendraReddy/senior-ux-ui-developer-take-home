import { X } from "lucide-react";
import type { ActiveExecution, AgentLog, AgentStatus } from "../types";
import { formatLogTime, statusLabel } from "../utils/format";
import { StatusPill } from "./StatusPill";

interface DetailsDrawerProps {
  execution: ActiveExecution | null;
  logs: AgentLog[];
  open: boolean;
  status: AgentStatus;
  onClose: () => void;
}

export function DetailsDrawer({ execution, logs, open, status, onClose }: DetailsDrawerProps) {
  if (!open || !execution) {
    return null;
  }

  return (
    <div className="drawer-backdrop" role="presentation">
      <aside
        aria-labelledby="execution-details-heading"
        aria-modal="true"
        className="details-drawer"
        role="dialog"
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Execution details</p>
            <h2 id="execution-details-heading">{execution.taskLabel}</h2>
          </div>
          <button aria-label="Close details" className="icon-button" type="button" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="drawer-status">
          <StatusPill value={status} />
          <span>{statusLabel(status)}</span>
        </div>

        <dl className="detail-list">
          <div>
            <dt>Run ID</dt>
            <dd>{execution.runId}</dd>
          </div>
          <div>
            <dt>Repository</dt>
            <dd>
              {execution.repoOwner}/{execution.repoName}
            </dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{execution.runtime}</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>{execution.estimatedFiles.toLocaleString()} files or records</dd>
          </div>
          <div>
            <dt>Branch</dt>
            <dd>{execution.branch}</dd>
          </div>
          <div>
            <dt>Attempt</dt>
            <dd>{execution.attempt}</dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>{formatLogTime(execution.startedAt)}</dd>
          </div>
          <div>
            <dt>Finished</dt>
            <dd>{execution.finishedAt ? formatLogTime(execution.finishedAt) : "In progress"}</dd>
          </div>
        </dl>

        <section className="drawer-section" aria-labelledby="summary-heading">
          <h3 id="summary-heading">Summary</h3>
          <p>{execution.summary}</p>
        </section>

        <section className="drawer-section" aria-labelledby="run-profile-heading">
          <h3 id="run-profile-heading">Repository run profile</h3>
          <div className="run-profile-card">
            <span>{execution.dataSource ?? "Mock workspace"}</span>
            <strong>
              {execution.repoOwner}/{execution.repoName}
            </strong>
            <p>{execution.suites.join(" / ")}</p>
            {execution.repoUrl ? (
              <a href={execution.repoUrl} target="_blank" rel="noreferrer">
                Open source repository
              </a>
            ) : null}
          </div>
        </section>

        <section className="drawer-section" aria-labelledby="mandatory-actions-heading">
          <h3 id="mandatory-actions-heading">Mandatory repository actions</h3>
          <div className="mandatory-action-list">
            {execution.mandatoryActions.map((action) => (
              <article className={`mandatory-action mandatory-action--${action.status}`} key={action.label}>
                <span>{action.status}</span>
                <strong>{action.label}</strong>
                <p>{action.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="drawer-section" aria-labelledby="workflow-actions-heading">
          <h3 id="workflow-actions-heading">Full agent workflow results</h3>
          <div className="workflow-action-grid">
            {execution.workflowActions.map((action) => (
              <article className={`workflow-action workflow-action--${action.status}`} key={action.label}>
                <span>{action.status}</span>
                <strong>{action.label}</strong>
                <p>{action.summary}</p>
                <small>{action.detail}</small>
              </article>
            ))}
          </div>
        </section>

        {execution.dataset ? (
          <section className="drawer-section" aria-labelledby="dataset-heading">
            <h3 id="dataset-heading">Basic data source</h3>
            <div className="run-profile-card run-profile-card--dataset">
              <span>{execution.dataset.source}</span>
              <strong>{execution.dataset.name}</strong>
              <p>
                {execution.dataset.records} / {execution.dataset.license}
              </p>
              <a href={execution.dataset.url} target="_blank" rel="noreferrer">
                Open free dataset reference
              </a>
            </div>
          </section>
        ) : null}

        <section className="drawer-section" aria-labelledby="artifacts-heading">
          <h3 id="artifacts-heading">Artifacts</h3>
          {execution.artifacts.length > 0 ? (
            <ul className="artifact-list">
              {execution.artifacts.map((artifact) => (
                <li key={`${artifact.label}-${artifact.value}`}>
                  <span>{artifact.label}</span>
                  <strong>{artifact.value}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Artifacts appear after the run completes.</p>
          )}
        </section>

        <section className="drawer-section" aria-labelledby="timeline-heading">
          <h3 id="timeline-heading">Timeline</h3>
          <ol className="timeline-list">
            {logs.map((log) => (
              <li key={log.id}>
                <time>{formatLogTime(log.timestamp)}</time>
                <span>{log.step}</span>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}
