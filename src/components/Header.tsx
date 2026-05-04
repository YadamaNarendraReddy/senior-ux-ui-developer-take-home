import { Activity, AlertTriangle, GitBranch, ShieldCheck } from "lucide-react";
import type { Repository } from "../types";

interface HeaderProps {
  repositories: Repository[];
  onResetWorkspace: () => void;
  onShowAllRepos: () => void;
  onShowCriticalRepos: () => void;
  onShowReadyRepos: () => void;
  onShowSafeSimulation: () => void;
  onShowTakeHomeScenario: () => void;
}

export function Header({
  repositories,
  onResetWorkspace,
  onShowAllRepos,
  onShowCriticalRepos,
  onShowReadyRepos,
  onShowSafeSimulation,
  onShowTakeHomeScenario
}: HeaderProps) {
  const criticalRepos = repositories.filter((repo) => repo.status === "critical").length;
  const averageReadiness = Math.round(
    repositories.reduce((total, repo) => total + repo.agentReadiness, 0) / repositories.length
  );

  return (
    <header className="portal-header">
      <button
        className="brand-lockup"
        type="button"
        aria-label="Reset dashboard"
        onClick={onResetWorkspace}
      >
        <span className="brand-mark">
          <GitBranch size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">Developer Platform</p>
          <h1>Agentic Developer Portal</h1>
        </div>
      </button>

      <div className="header-metrics" aria-label="Repository estate summary">
        <button
          className="header-metric"
          type="button"
          aria-label="Show all repositories"
          onClick={onShowAllRepos}
        >
          <GitBranch size={16} aria-hidden="true" />
          <span>{repositories.length} repos</span>
        </button>
        <button
          className="header-metric"
          type="button"
          aria-label="Show healthy ready repositories"
          onClick={onShowReadyRepos}
        >
          <Activity size={16} aria-hidden="true" />
          <span>{averageReadiness}% ready</span>
        </button>
        <button
          className="header-metric header-metric--alert"
          type="button"
          aria-label="Show critical repositories"
          onClick={onShowCriticalRepos}
        >
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{criticalRepos} critical</span>
        </button>
      </div>

      <div className="header-actions">
        <button
          className="environment-pill"
          type="button"
          aria-label="Open safe simulation scenario"
          onClick={onShowSafeSimulation}
        >
          <ShieldCheck size={16} aria-hidden="true" />
          Prod-safe simulation
        </button>
        <button
          className="user-pill"
          type="button"
          aria-label="Open take-home demo scenario"
          onClick={onShowTakeHomeScenario}
        >
          Narendra UX/UI Development
        </button>
      </div>
    </header>
  );
}
