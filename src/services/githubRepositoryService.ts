import { repositories as fallbackRepositories } from "../data/mockData";
import type { AgentTaskId, CiStatus, Repository, RepositoryLanguage, RepositoryStatus } from "../types";

interface GitHubRepositoryResponse {
  default_branch: string;
  description: string | null;
  forks_count: number;
  full_name: string;
  html_url: string;
  language: string | null;
  name: string;
  open_issues_count: number;
  owner: {
    login: string;
  };
  pushed_at: string;
  stargazers_count: number;
  updated_at: string;
}

interface PublicRepositoryTarget {
  dataset?: Repository["dataset"];
  executionProfile: NonNullable<Repository["executionProfile"]>;
  fallbackId: string;
  framework: string;
  fullName: string;
  healthProfile: HealthProfile;
  language: RepositoryLanguage;
  recommendedTasks: AgentTaskId[];
  successStory: string;
}

interface HealthProfile {
  agentReadiness: number;
  ciStatus: CiStatus;
  dependenciesOutdated: number;
  deployStatus: Repository["deployStatus"];
  status: RepositoryStatus;
  successRate: number;
  testCoverage: number;
  vulnerabilities: number;
}

const PUBLIC_REPOSITORIES: PublicRepositoryTarget[] = [
  {
    fallbackId: "repo-atlas-web",
    executionProfile: {
      estimatedFiles: 2480,
      runtime: "React package validation",
      suites: ["workspace restore", "lint", "unit tests", "package checks"]
    },
    framework: "React library",
    fullName: "facebook/react",
    healthProfile: {
      agentReadiness: 100,
      ciStatus: "passing",
      dependenciesOutdated: 0,
      deployStatus: "healthy",
      status: "healthy",
      successRate: 100,
      testCoverage: 100,
      vulnerabilities: 0
    },
    language: "React",
    recommendedTasks: ["run-tests", "create-pr", "refactor"],
    successStory: "Stable component platform with strong review activity and broad production adoption."
  },
  {
    fallbackId: "repo-design-token-service",
    executionProfile: {
      estimatedFiles: 1380,
      runtime: "Vite monorepo validation",
      suites: ["dependency graph", "typecheck", "unit tests", "build smoke"]
    },
    framework: "Vite",
    fullName: "vitejs/vite",
    healthProfile: {
      agentReadiness: 98,
      ciStatus: "passing",
      dependenciesOutdated: 1,
      deployStatus: "healthy",
      status: "healthy",
      successRate: 100,
      testCoverage: 99,
      vulnerabilities: 0
    },
    language: "TypeScript",
    recommendedTasks: ["run-tests", "dependency-upgrade", "create-pr"],
    successStory: "Modern frontend build system with a healthy release profile and active maintainers."
  },
  {
    fallbackId: "repo-checkout-api",
    executionProfile: {
      estimatedFiles: 3120,
      runtime: "TypeScript compiler validation",
      suites: ["branch policy", "typecheck", "compiler fixtures", "smoke tests"]
    },
    framework: "TypeScript compiler",
    fullName: "microsoft/TypeScript",
    healthProfile: {
      agentReadiness: 86,
      ciStatus: "warning",
      dependenciesOutdated: 6,
      deployStatus: "degraded",
      status: "attention",
      successRate: 88,
      testCoverage: 91,
      vulnerabilities: 1
    },
    language: "TypeScript",
    recommendedTasks: ["run-tests", "refactor", "create-pr"],
    successStory: "Language platform with mature governance and dependable engineering workflows."
  },
  {
    fallbackId: "repo-ml-inference-gateway",
    executionProfile: {
      estimatedFiles: 920,
      runtime: "Fastify API validation",
      suites: ["dependency graph", "route tests", "security scan", "runtime smoke"]
    },
    framework: "Fastify",
    fullName: "fastify/fastify",
    healthProfile: {
      agentReadiness: 82,
      ciStatus: "warning",
      dependenciesOutdated: 8,
      deployStatus: "degraded",
      status: "attention",
      successRate: 84,
      testCoverage: 87,
      vulnerabilities: 2
    },
    language: "Node",
    recommendedTasks: ["run-tests", "dependency-upgrade", "security-scan"],
    successStory: "High-performance API framework with a polished release and plugin ecosystem."
  },
  {
    fallbackId: "repo-mobile-release-orchestrator",
    dataset: {
      license: "CC0: Public Domain",
      name: "Titanic passenger survival dataset",
      records: "891 rows / 12 columns",
      source: "Kaggle + DataScienceDojo public datasets",
      url: "https://www.kaggle.com/datasets/smirkxd/titanic-dataset"
    },
    executionProfile: {
      estimatedFiles: 892,
      failFirstAttempt: true,
      failureReason: "Dataset validation stopped at row integrity checks before model artifacts were produced.",
      runtime: "Basic data repository validation",
      suites: ["schema scan", "CSV row validation", "missing value profile", "baseline model smoke"]
    },
    framework: "CSV dataset",
    fullName: "datasciencedojo/datasets",
    healthProfile: {
      agentReadiness: 62,
      ciStatus: "failing",
      dependenciesOutdated: 16,
      deployStatus: "blocked",
      status: "critical",
      successRate: 64,
      testCoverage: 72,
      vulnerabilities: 5
    },
    language: "TypeScript",
    recommendedTasks: ["run-tests", "create-pr", "refactor"],
    successStory: "Free public Titanic dataset used as a basic data repository for agent-run validation."
  },
  {
    fallbackId: "repo-compliance-gateway",
    executionProfile: {
      estimatedFiles: 2760,
      runtime: "Next.js app validation",
      suites: ["dependency graph", "typecheck", "route smoke", "security policy"]
    },
    framework: "Next.js",
    fullName: "vercel/next.js",
    healthProfile: {
      agentReadiness: 58,
      ciStatus: "failing",
      dependenciesOutdated: 19,
      deployStatus: "blocked",
      status: "critical",
      successRate: 61,
      testCoverage: 69,
      vulnerabilities: 7
    },
    language: "React",
    recommendedTasks: ["run-tests", "create-pr", "dependency-upgrade"],
    successStory: "Production-grade React framework with visible release cadence and strong community usage."
  }
];

const FALLBACK_TARGET_PROFILES = PUBLIC_REPOSITORIES.map((repository) => ({
  dataset: repository.dataset,
  executionProfile: repository.executionProfile,
  fallbackId: repository.fallbackId,
  fullName: repository.fullName,
  healthProfile: repository.healthProfile
}));

function parseLastPageCount(response: Response, fallback: number) {
  const link = response.headers.get("Link");

  if (!link) {
    return fallback;
  }

  const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? Number(match[1]) : fallback;
}

async function fetchCount(url: string, fallback: number) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    return fallback;
  }

  return parseLastPageCount(response, fallback);
}

function applyHealthProfile(repository: Repository, healthProfile: HealthProfile): Repository {
  return {
    ...repository,
    vulnerabilities: healthProfile.vulnerabilities,
    testCoverage: healthProfile.testCoverage,
    dependenciesOutdated: healthProfile.dependenciesOutdated,
    status: healthProfile.status,
    ciStatus: healthProfile.ciStatus,
    deployStatus: healthProfile.deployStatus,
    agentReadiness: healthProfile.agentReadiness,
    successRate: healthProfile.successRate
  };
}

function applyTargetProfile(repository: Repository): Repository {
  const targetProfile =
    FALLBACK_TARGET_PROFILES.find((profile) => profile.fallbackId === repository.id) ??
    FALLBACK_TARGET_PROFILES[0];

  return {
    ...applyHealthProfile(repository, targetProfile.healthProfile),
    dataset: targetProfile.dataset,
    executionProfile: targetProfile.executionProfile,
    url: repository.url ?? `https://github.com/${targetProfile.fullName}`
  };
}

async function toRepository(target: PublicRepositoryTarget): Promise<Repository> {
  const fallback = fallbackRepositories.find((repo) => repo.id === target.fallbackId) ?? fallbackRepositories[0];
  const repoResponse = await fetch(`https://api.github.com/repos/${target.fullName}`, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!repoResponse.ok) {
    throw new Error(`GitHub repository request failed for ${target.fullName}`);
  }

  const repo = (await repoResponse.json()) as GitHubRepositoryResponse;
  const [openPrs, contributors] = await Promise.all([
    fetchCount(`https://api.github.com/repos/${target.fullName}/pulls?state=open&per_page=1`, fallback.openPrs),
    fetchCount(`https://api.github.com/repos/${target.fullName}/contributors?per_page=1`, fallback.contributors)
  ]);
  const issueCount = Math.max(repo.open_issues_count - openPrs, 0);
  const repository: Repository = {
    id: `github-${target.fullName.replace("/", "-")}`,
    name: repo.name,
    owner: repo.owner.login,
    description: repo.description ?? fallback.description,
    visibility: "Public",
    language: target.language,
    framework: target.framework,
    url: repo.html_url,
    dataSource: "Live GitHub",
    dataset: target.dataset,
    defaultBranch: repo.default_branch,
    stars: repo.stargazers_count,
    openPrs,
    issues: issueCount,
    vulnerabilities: target.healthProfile.vulnerabilities,
    testCoverage: target.healthProfile.testCoverage,
    lastCommit: repo.pushed_at,
    lastRelease: repo.updated_at,
    contributors,
    dependenciesOutdated: target.healthProfile.dependenciesOutdated,
    successRate: target.healthProfile.successRate,
    status: target.healthProfile.status,
    ciStatus: target.healthProfile.ciStatus,
    deployStatus: target.healthProfile.deployStatus,
    agentReadiness: target.healthProfile.agentReadiness,
    executionProfile: target.executionProfile,
    insights: [
      `${repo.full_name} is loaded from the public GitHub API for live repository visibility.`,
      `${target.successStory}`,
      ...(target.dataset
        ? [
            `${target.dataset.name} is referenced as free basic data from ${target.dataset.source} with ${target.dataset.records}.`
          ]
        : []),
      `Portfolio status is set to ${target.healthProfile.status} for the demo mix: ${target.healthProfile.successRate}% success rate, ${target.healthProfile.testCoverage}% coverage, and ${target.healthProfile.agentReadiness}% agent readiness.`,
      `${contributors} contributors and ${repo.stargazers_count.toLocaleString()} stars provide current collaboration context.`
    ],
    recentActivity: [
      {
        id: `${repo.full_name}-pushed`,
        title: "Successful repository signal",
        description: `Default branch ${repo.default_branch} was last updated on GitHub.`,
        timestamp: repo.pushed_at
      },
      {
        id: `${repo.full_name}-synced`,
        title: "Repository health profile synced",
        description: `Current portal status is ${target.healthProfile.status} with ${target.healthProfile.successRate}% success rate.`,
        timestamp: new Date().toISOString()
      },
      ...(target.dataset
        ? [
            {
              id: `${repo.full_name}-dataset`,
              title: "Basic data profile attached",
              description: `${target.dataset.name} is available for schema and row validation during agent execution.`,
              timestamp: new Date().toISOString()
            }
          ]
        : [])
    ],
    recommendedTasks: target.recommendedTasks
  };

  return applyHealthProfile(repository, target.healthProfile);
}

export async function fetchRepositoryData() {
  const settled = await Promise.allSettled(PUBLIC_REPOSITORIES.map((target) => toRepository(target)));
  const liveRepositories = settled
    .filter((result): result is PromiseFulfilledResult<Repository> => result.status === "fulfilled")
    .map((result) => result.value);

  return liveRepositories.length > 0
    ? liveRepositories
    : fallbackRepositories.map((repository) => applyTargetProfile(repository));
}
