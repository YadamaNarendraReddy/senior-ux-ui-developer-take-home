import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import type { Repository, RepositoryLanguage, RepositoryStatus } from "../types";
import { statusLabel } from "../utils/format";
import { StatusPill } from "./StatusPill";

interface RepositoryListProps {
  languageFilter: RepositoryLanguage | "all";
  languageOptions: RepositoryLanguage[];
  repositories: Repository[];
  repositoryCount: number;
  searchTerm: string;
  selectedRepoId: string;
  statusFilter: RepositoryStatus | "all";
  onLanguageFilterChange: (value: RepositoryLanguage | "all") => void;
  onOpenRepo: (repoId: string) => void;
  onSearchTermChange: (value: string) => void;
  onSelectRepo: (repoId: string) => void;
  onStatusFilterChange: (value: RepositoryStatus | "all") => void;
}

export function RepositoryList({
  languageFilter,
  languageOptions,
  repositories,
  repositoryCount,
  searchTerm,
  selectedRepoId,
  statusFilter,
  onLanguageFilterChange,
  onOpenRepo,
  onSearchTermChange,
  onSelectRepo,
  onStatusFilterChange
}: RepositoryListProps) {
  return (
    <aside className="repo-sidebar" aria-label="Repository selection">
      <div className="repo-sidebar__header">
        <div>
          <p className="eyebrow">Repositories</p>
          <h2>Choose a repository</h2>
        </div>
        <span className="count-pill">
          {repositories.length}/{repositoryCount}
        </span>
      </div>

      <div className="repo-filters">
        <label className="search-field" htmlFor="repo-search">
          <Search size={16} aria-hidden="true" />
          <input
            id="repo-search"
            placeholder="Search repositories"
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </label>

        <div className="filter-row" aria-label="Repository filters">
          <label className="select-field">
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                onStatusFilterChange(event.target.value as RepositoryStatus | "all")
              }
            >
              <option value="all">All</option>
              <option value="healthy">Healthy</option>
              <option value="attention">Needs attention</option>
              <option value="critical">Critical</option>
            </select>
          </label>

          <label className="select-field">
            <span>Language</span>
            <select
              value={languageFilter}
              onChange={(event) =>
                onLanguageFilterChange(event.target.value as RepositoryLanguage | "all")
              }
            >
              <option value="all">All</option>
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="repo-list" role="list">
        {repositories.length > 0 ? (
          repositories.map((repo) => (
            <article
              className={`repo-card ${repo.id === selectedRepoId ? "is-selected" : ""}`}
              key={repo.id}
              role="listitem"
            >
              <button
                className="repo-card__select"
                type="button"
                onClick={() => onSelectRepo(repo.id)}
              >
                <span className="repo-card__topline">
                  <span className="repo-card__title">
                    <strong>{repo.name}</strong>
                    <small className="repo-card__owner">Team: {repo.owner}</small>
                  </span>
                  <StatusPill compact value={repo.status} />
                </span>

                <span className="repo-card__description">{repo.description}</span>

                <span className="repo-card__meta">
                  <span>{repo.language}</span>
                  <span>{statusLabel(repo.ciStatus)} CI</span>
                  <span>{repo.visibility}</span>
                </span>

                <span className="repo-card__action">
                  Select repository
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </button>

              <button
                className="repo-card__open"
                type="button"
                onClick={() => onOpenRepo(repo.id)}
              >
                Open repository
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <strong>No repositories found</strong>
            <span>Adjust search or filters.</span>
          </div>
        )}
      </div>
    </aside>
  );
}
