import type { AgentTask, Repository } from "../types";

export const repositories: Repository[] = [
  {
    id: "repo-atlas-web",
    name: "atlas-web",
    owner: "platform-experience",
    description: "React shell for internal developer workflows and service ownership.",
    visibility: "Internal",
    language: "React",
    framework: "Vite + React",
    url: "https://github.com/facebook/react",
    defaultBranch: "main",
    stars: 148,
    openPrs: 7,
    issues: 18,
    vulnerabilities: 1,
    testCoverage: 92,
    lastCommit: "2026-04-30T16:45:00Z",
    lastRelease: "2026-04-24T13:12:00Z",
    contributors: 22,
    dependenciesOutdated: 6,
    status: "healthy",
    ciStatus: "passing",
    deployStatus: "healthy",
    agentReadiness: 96,
    insights: [
      "Unit test coverage increased by 4 percent after the last release.",
      "Dependency drift is low, but frontend build packages are one minor version behind.",
      "Recent pull requests are concentrated around navigation and permissions."
    ],
    recentActivity: [
      {
        id: "act-atlas-1",
        title: "PR #482 merged",
        description: "Added service ownership badges to repo cards.",
        timestamp: "2026-04-30T14:32:00Z"
      },
      {
        id: "act-atlas-2",
        title: "CI workflow optimized",
        description: "Reduced build time by 18 percent with dependency caching.",
        timestamp: "2026-04-29T19:08:00Z"
      }
    ],
    recommendedTasks: ["run-tests", "dependency-upgrade", "create-pr"]
  },
  {
    id: "repo-checkout-api",
    name: "checkout-api",
    owner: "commerce-platform",
    description: "Node service that coordinates order creation, tax, and payment capture.",
    visibility: "Private",
    language: "Node",
    framework: "NestJS",
    url: "https://github.com/microsoft/TypeScript",
    defaultBranch: "main",
    stars: 89,
    openPrs: 4,
    issues: 31,
    vulnerabilities: 3,
    testCoverage: 81,
    lastCommit: "2026-04-29T21:16:00Z",
    lastRelease: "2026-04-17T11:22:00Z",
    contributors: 17,
    dependenciesOutdated: 14,
    status: "attention",
    ciStatus: "warning",
    deployStatus: "degraded",
    agentReadiness: 84,
    insights: [
      "Integration test failures are isolated to payment-provider mocks.",
      "Four dependencies have security advisories with patched versions available.",
      "Release cadence slowed over the last two sprints."
    ],
    recentActivity: [
      {
        id: "act-checkout-1",
        title: "Test flake detected",
        description: "Payment retry workflow failed twice in nightly runs.",
        timestamp: "2026-04-30T03:12:00Z"
      },
      {
        id: "act-checkout-2",
        title: "Dependency alert opened",
        description: "Transitive validation package has a patch available.",
        timestamp: "2026-04-28T15:40:00Z"
      }
    ],
    recommendedTasks: ["dependency-upgrade", "run-tests", "refactor"]
  },
  {
    id: "repo-design-token-service",
    name: "design-token-service",
    owner: "design-systems",
    description: "TypeScript service that publishes design tokens to app teams.",
    visibility: "Internal",
    language: "TypeScript",
    framework: "Fastify",
    url: "https://github.com/vitejs/vite",
    defaultBranch: "trunk",
    stars: 121,
    openPrs: 2,
    issues: 9,
    vulnerabilities: 0,
    testCoverage: 88,
    lastCommit: "2026-04-30T10:03:00Z",
    lastRelease: "2026-04-26T09:25:00Z",
    contributors: 11,
    dependenciesOutdated: 4,
    status: "healthy",
    ciStatus: "passing",
    deployStatus: "healthy",
    agentReadiness: 91,
    insights: [
      "Token publishing jobs are stable across the last 20 runs.",
      "Two stale feature flags can be removed from the publish pipeline.",
      "Snapshot tests have high confidence for generated CSS output."
    ],
    recentActivity: [
      {
        id: "act-token-1",
        title: "Release 4.12.0 published",
        description: "Added semantic spacing tokens for platform teams.",
        timestamp: "2026-04-26T09:25:00Z"
      },
      {
        id: "act-token-2",
        title: "Branch policy updated",
        description: "Enabled required review for token schema changes.",
        timestamp: "2026-04-24T17:18:00Z"
      }
    ],
    recommendedTasks: ["refactor", "create-pr", "run-tests"]
  },
  {
    id: "repo-ml-inference-gateway",
    name: "ml-inference-gateway",
    owner: "ai-platform",
    description: "Python gateway for model routing, request shaping, and evaluation hooks.",
    visibility: "Private",
    language: "Python",
    framework: "FastAPI",
    url: "https://github.com/fastify/fastify",
    defaultBranch: "main",
    stars: 203,
    openPrs: 12,
    issues: 42,
    vulnerabilities: 5,
    testCoverage: 76,
    lastCommit: "2026-04-30T18:58:00Z",
    lastRelease: "2026-04-12T08:30:00Z",
    contributors: 28,
    dependenciesOutdated: 19,
    status: "attention",
    ciStatus: "warning",
    deployStatus: "degraded",
    agentReadiness: 78,
    insights: [
      "Load-test traces show higher latency after the last routing change.",
      "Dependency drift is concentrated in observability and eval tooling.",
      "Open pull requests are blocked by flaky async integration tests."
    ],
    recentActivity: [
      {
        id: "act-ml-1",
        title: "Latency regression flagged",
        description: "P95 increased by 11 percent on batch inference paths.",
        timestamp: "2026-04-30T07:16:00Z"
      },
      {
        id: "act-ml-2",
        title: "Eval harness updated",
        description: "Added new regression suite for prompt routing policies.",
        timestamp: "2026-04-27T22:04:00Z"
      }
    ],
    recommendedTasks: ["run-tests", "refactor", "dependency-upgrade"]
  },
  {
    id: "repo-mobile-release-orchestrator",
    name: "mobile-release-orchestrator",
    owner: "release-engineering",
    description: "Go service that coordinates mobile build promotion and release gates.",
    visibility: "Internal",
    language: "Go",
    framework: "Go kit",
    url: "https://github.com/datasciencedojo/datasets",
    defaultBranch: "main",
    stars: 77,
    openPrs: 5,
    issues: 16,
    vulnerabilities: 2,
    testCoverage: 86,
    lastCommit: "2026-04-28T20:20:00Z",
    lastRelease: "2026-04-22T12:00:00Z",
    contributors: 14,
    dependenciesOutdated: 8,
    status: "healthy",
    ciStatus: "passing",
    deployStatus: "healthy",
    agentReadiness: 89,
    insights: [
      "Release promotion checks are passing across iOS and Android lanes.",
      "Build graph logic has duplicate validation paths that are good refactor candidates.",
      "Two open pull requests need generated client updates."
    ],
    recentActivity: [
      {
        id: "act-mobile-1",
        title: "Release gate passed",
        description: "Nightly release candidate was promoted to staging.",
        timestamp: "2026-04-30T05:44:00Z"
      },
      {
        id: "act-mobile-2",
        title: "Generated clients refreshed",
        description: "Updated mobile release API clients from service schema.",
        timestamp: "2026-04-25T18:12:00Z"
      }
    ],
    recommendedTasks: ["create-pr", "refactor", "run-tests"]
  },
  {
    id: "repo-compliance-gateway",
    name: "compliance-gateway",
    owner: "trust-platform",
    description: "Node gateway for policy checks, audit events, and compliance exports.",
    visibility: "Private",
    language: "Node",
    framework: "Express",
    url: "https://github.com/vercel/next.js",
    defaultBranch: "main",
    stars: 66,
    openPrs: 11,
    issues: 38,
    vulnerabilities: 9,
    testCoverage: 69,
    lastCommit: "2026-04-30T23:11:00Z",
    lastRelease: "2026-03-29T10:15:00Z",
    contributors: 19,
    dependenciesOutdated: 23,
    status: "critical",
    ciStatus: "failing",
    deployStatus: "blocked",
    agentReadiness: 62,
    insights: [
      "CI is failing because audit export contract tests are out of date.",
      "Nine dependency vulnerabilities need patch planning before release.",
      "Security scan coverage dropped after the legacy policy adapter change."
    ],
    recentActivity: [
      {
        id: "act-compliance-1",
        title: "Required check failed",
        description: "Audit export contract tests failed on main.",
        timestamp: "2026-04-30T23:11:00Z"
      },
      {
        id: "act-compliance-2",
        title: "Security exception opened",
        description: "Two high severity advisories require owner review.",
        timestamp: "2026-04-29T16:52:00Z"
      }
    ],
    recommendedTasks: ["security-scan", "dependency-upgrade", "run-tests"]
  }
];

export const taskCatalog: AgentTask[] = [
  {
    id: "run-tests",
    label: "Run test suite",
    description: "Execute unit, integration, and smoke tests with a failure summary.",
    category: "Quality",
    estimatedMinutes: 4,
    risk: "low"
  },
  {
    id: "security-scan",
    label: "Security scan",
    description: "Scan dependencies and code paths, then summarize policy exceptions.",
    category: "Security",
    estimatedMinutes: 7,
    risk: "high"
  },
  {
    id: "dependency-upgrade",
    label: "Upgrade dependencies",
    description: "Create a safe dependency patch plan and prepare an upgrade branch.",
    category: "Dependencies",
    estimatedMinutes: 9,
    risk: "medium"
  },
  {
    id: "create-pr",
    label: "Create PR",
    description: "Generate a small pull request with implementation notes and checks.",
    category: "Code",
    estimatedMinutes: 6,
    risk: "medium"
  },
  {
    id: "refactor",
    label: "Refactor module",
    description: "Identify a low-risk refactor candidate and draft code changes.",
    category: "Code",
    estimatedMinutes: 8,
    risk: "medium"
  }
];
