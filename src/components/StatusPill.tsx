import type { AgentRisk, AgentStatus, CiStatus, RepositoryStatus } from "../types";
import { riskLabel, statusLabel } from "../utils/format";

type PillKind =
  | RepositoryStatus
  | AgentStatus
  | CiStatus
  | AgentRisk
  | "internal"
  | "private"
  | "public";

interface StatusPillProps {
  value: PillKind;
  label?: string;
  compact?: boolean;
}

export function StatusPill({ compact = false, label, value }: StatusPillProps) {
  const visibleLabel =
    label ??
    (value === "low" || value === "medium" || value === "high"
      ? riskLabel(value)
      : statusLabel(value as RepositoryStatus | AgentStatus | CiStatus));

  return (
    <span className={`status-pill status-pill--${value} ${compact ? "is-compact" : ""}`}>
      <span className="status-dot" aria-hidden="true" />
      {visibleLabel}
    </span>
  );
}
