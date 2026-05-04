import { ExternalLink, GitBranch, Star, X } from "lucide-react";
import type { Repository } from "../types";
import { formatNumber, formatPercent, formatShortDate, statusLabel } from "../utils/format";
import { StatusPill } from "./StatusPill";

interface RepositoryDetailWindowProps {
  open: boolean;
  repository: Repository;
  onClose: () => void;
}

export function RepositoryDetailWindow({
  onClose,
  open,
  repository
}: RepositoryDetailWindowProps) {
  if (!open) {
    return null;
  }

  const successRate = repository.successRate ?? repository.agentReadiness;
  const facts = [
    ["Owner", repository.owner],
    ["Framework", repository.framework],
    ["Language", repository.language],
    ["Default branch", repository.defaultBranch],
    ["Open PRs", formatNumber(repository.openPrs)],
    ["Open issues", formatNumber(repository.issues)],
    ["Stars", formatNumber(repository.stars)],
    ["Contributors", formatNumber(repository.contributors)],
    ["Coverage", formatPercent(repository.testCoverage)],
    ["Success rate", formatPercent(successRate)],
    ["Agent readiness", formatPercent(repository.agentReadiness)],
    ["Last commit", formatShortDate(repository.lastCommit)],
    ["Data source", repository.dataSource ?? "Mock workspace"]
  ];

  return (
    <div className="repo-window-backdrop" role="presentation">
      <section className="repo-window" aria-label={`${repository.name} repository details`}>
        <div className="repo-window__header">
          <div>
            <p className="eyebrow">Repository detail window</p>
            <h2>{repository.name}</h2>
            <span>
              {repository.owner} / {repository.defaultBranch}
            </span>
          </div>
          <button className="icon-button" type="button" aria-label="Close repository detail" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="repo-window__hero">
          <div>
            <p>{repository.description}</p>
            <div className="repo-window__pills">
              <StatusPill value={repository.status} />
              <StatusPill value={repository.ciStatus} />
              <StatusPill value={repository.visibility.toLowerCase() as "internal" | "private" | "public"} />
            </div>
          </div>
          <div className="repo-window__score">
            <span>Success rate</span>
            <strong>{formatPercent(successRate)}</strong>
          </div>
        </div>

        <div className="repo-window__stats">
          {facts.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="repo-window__columns">
          <section>
            <div className="repo-window__section-title">
              <GitBranch size={17} aria-hidden="true" />
              <h3>Repository signals</h3>
            </div>
            <ul>
              {repository.insights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </section>

          <section>
            <div className="repo-window__section-title">
              <Star size={17} aria-hidden="true" />
              <h3>Recent activity</h3>
            </div>
            <div className="repo-window__activity">
              {repository.recentActivity.map((activity) => (
                <article key={activity.id}>
                  <time>{formatShortDate(activity.timestamp)}</time>
                  <strong>{activity.title}</strong>
                  <p>{activity.description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="repo-window__footer">
          <button className="secondary-action" type="button" onClick={onClose}>
            Close
          </button>
          {repository.url ? (
            <a className="repo-window__link" href={repository.url} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              Open direct repository
            </a>
          ) : (
            <span className="repo-window__unavailable">Repository link unavailable</span>
          )}
        </footer>
      </section>
    </div>
  );
}
