import type { AgentRisk, AgentStatus, CiStatus, RepositoryStatus } from "../types";

const numberFormatter = new Intl.NumberFormat("en-US");

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric"
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatPercent(value: number) {
  return `${value}%`;
}

export function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(value));
}

export function formatLogTime(value: string) {
  return timeFormatter.format(new Date(value));
}

export function formatRuntimeMinutes(seconds: number) {
  if (seconds <= 0) {
    return "0 min";
  }

  const minutes = seconds / 60;

  if (minutes < 1) {
    return `${minutes.toFixed(1)} min`;
  }

  return `${Math.ceil(minutes)} min`;
}

export function statusLabel(status: RepositoryStatus | AgentStatus | CiStatus) {
  const labels: Record<string, string> = {
    attention: "Needs attention",
    critical: "Critical",
    failure: "Failed",
    failing: "Failing",
    healthy: "Healthy",
    idle: "Idle",
    internal: "Internal",
    passing: "Passing",
    pending: "Pending",
    private: "Private",
    public: "Public",
    running: "Running",
    success: "Succeeded",
    warning: "Warning"
  };

  return labels[status] ?? status;
}

export function riskLabel(risk: AgentRisk) {
  const labels: Record<AgentRisk, string> = {
    low: "Low risk",
    medium: "Medium risk",
    high: "High risk"
  };

  return labels[risk];
}
