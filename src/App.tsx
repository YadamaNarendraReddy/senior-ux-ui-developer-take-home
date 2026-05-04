import { useEffect, useMemo, useState } from "react";
import { AgentExecutionPanel } from "./components/AgentExecutionPanel";
import { DetailsDrawer } from "./components/DetailsDrawer";
import { Header } from "./components/Header";
import { RepositoryDetailWindow } from "./components/RepositoryDetailWindow";
import { RepositoryList } from "./components/RepositoryList";
import { RepositoryOverview } from "./components/RepositoryOverview";
import { repositories as fallbackRepositories, taskCatalog } from "./data/mockData";
import { useAgentExecution } from "./hooks/useAgentExecution";
import { fetchRepositoryData } from "./services/githubRepositoryService";
import type { AgentTaskId, RepositoryLanguage, RepositoryStatus, TaskRunState } from "./types";

function getRunDurationSeconds(startedAt: string, finishedAt?: string) {
  if (!finishedAt) {
    return null;
  }

  const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(1, Math.ceil(durationMs / 1000));
}

function App() {
  const [repositoryData, setRepositoryData] = useState(fallbackRepositories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RepositoryStatus | "all">("all");
  const [languageFilter, setLanguageFilter] = useState<RepositoryLanguage | "all">("all");
  const [selectedRepoId, setSelectedRepoId] = useState(fallbackRepositories[0].id);
  const [selectedTaskId, setSelectedTaskId] = useState<AgentTaskId>(
    fallbackRepositories[0].recommendedTasks[0]
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRepoWindowOpen, setIsRepoWindowOpen] = useState(false);
  const [taskRunStates, setTaskRunStates] = useState<Record<string, TaskRunState>>({});
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(0);

  const {
    activeExecution,
    canRetry,
    currentStep,
    isActive,
    logs,
    progress,
    retryAgent,
    runAgent,
    status
  } = useAgentExecution();

  useEffect(() => {
    let isMounted = true;

    fetchRepositoryData()
      .then((liveRepositories) => {
        if (isMounted) {
          setRepositoryData(liveRepositories);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRepositoryData(fallbackRepositories);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const languageOptions = useMemo(
    () => Array.from(new Set(repositoryData.map((repo) => repo.language))),
    [repositoryData]
  );

  const filteredRepos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return repositoryData.filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(normalizedSearch) ||
        repo.owner.toLowerCase().includes(normalizedSearch) ||
        repo.description.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || repo.status === statusFilter;
      const matchesLanguage = languageFilter === "all" || repo.language === languageFilter;

      return matchesSearch && matchesStatus && matchesLanguage;
    });
  }, [languageFilter, repositoryData, searchTerm, statusFilter]);

  const selectedRepo = useMemo(
    () => repositoryData.find((repo) => repo.id === selectedRepoId) ?? repositoryData[0],
    [repositoryData, selectedRepoId]
  );

  const selectedTask = useMemo(
    () => taskCatalog.find((task) => task.id === selectedTaskId) ?? taskCatalog[0],
    [selectedTaskId]
  );

  useEffect(() => {
    if (!repositoryData.some((repo) => repo.id === selectedRepoId)) {
      setSelectedRepoId(repositoryData[0].id);
    }
  }, [repositoryData, selectedRepoId]);

  useEffect(() => {
    if (selectedRepo) {
      setSelectedTaskId(selectedRepo.recommendedTasks[0]);
    }
  }, [selectedRepo?.id]);

  useEffect(() => {
    if (!activeExecution?.finishedAt) {
      return;
    }

    const durationSeconds = getRunDurationSeconds(
      activeExecution.startedAt,
      activeExecution.finishedAt
    );

    if (!durationSeconds || (status !== "success" && status !== "failure")) {
      return;
    }

    setTaskRunStates((currentStates) => ({
      ...currentStates,
      [`${activeExecution.repoOwner}/${activeExecution.repoName}:${activeExecution.taskId}`]:
        {
          seconds: durationSeconds,
          status
        }
    }));
  }, [activeExecution?.finishedAt, activeExecution?.repoName, activeExecution?.repoOwner, activeExecution?.startedAt, activeExecution?.taskId, status]);

  useEffect(() => {
    if (!activeExecution || !isActive) {
      setLiveElapsedSeconds(0);
      return;
    }

    const execution = activeExecution;

    function updateElapsedSeconds() {
      setLiveElapsedSeconds(
        Math.max(1, Math.ceil((Date.now() - new Date(execution.startedAt).getTime()) / 1000))
      );
    }

    updateElapsedSeconds();
    const timerId = window.setInterval(updateElapsedSeconds, 1000);

    return () => window.clearInterval(timerId);
  }, [activeExecution?.runId, activeExecution?.startedAt, isActive]);

  function selectRepoAndTask(repoId: string, taskId?: AgentTaskId) {
    const repo = repositoryData.find((repository) => repository.id === repoId) ?? repositoryData[0];

    setSelectedRepoId(repo.id);
    setSelectedTaskId(taskId ?? repo.recommendedTasks[0]);
  }

  function handleSelectRepo(repoId: string) {
    selectRepoAndTask(repoId);
  }

  function handleOpenRepo(repoId: string) {
    selectRepoAndTask(repoId);
    setIsRepoWindowOpen(true);
  }

  function handleResetWorkspace() {
    setSearchTerm("");
    setStatusFilter("all");
    setLanguageFilter("all");
    setIsDetailsOpen(false);
    setIsRepoWindowOpen(false);
    selectRepoAndTask(repositoryData[0].id);
  }

  function handleShowAllRepos() {
    handleResetWorkspace();
  }

  function handleShowReadyRepos() {
    const firstHealthyRepo =
      repositoryData.find((repository) => repository.status === "healthy") ?? repositoryData[0];

    setSearchTerm("");
    setStatusFilter("healthy");
    setLanguageFilter("all");
    setIsDetailsOpen(false);
    selectRepoAndTask(firstHealthyRepo.id);
  }

  function handleShowCriticalRepos() {
    const firstCriticalRepo =
      repositoryData.find((repository) => repository.status === "critical") ?? repositoryData[0];

    setSearchTerm("");
    setStatusFilter("critical");
    setLanguageFilter("all");
    setIsDetailsOpen(false);
    selectRepoAndTask(firstCriticalRepo.id, "security-scan");
  }

  function handleShowSafeSimulation() {
    const firstHealthyRepo =
      repositoryData.find((repository) => repository.status === "healthy") ?? repositoryData[0];

    setSearchTerm("");
    setStatusFilter("healthy");
    setLanguageFilter("all");
    setIsDetailsOpen(false);
    selectRepoAndTask(firstHealthyRepo.id, "run-tests");
  }

  function handleShowTakeHomeScenario() {
    const criticalRepo =
      repositoryData.find((repository) => repository.status === "critical") ?? repositoryData[0];

    setSearchTerm("");
    setStatusFilter("critical");
    setLanguageFilter("all");
    setIsDetailsOpen(false);
    selectRepoAndTask(criticalRepo.id, "security-scan");
  }

  function handleRunAgent() {
    runAgent(selectedRepo, selectedTask);
  }

  return (
    <div className="app-shell">
      <Header
        repositories={repositoryData}
        onResetWorkspace={handleResetWorkspace}
        onShowAllRepos={handleShowAllRepos}
        onShowCriticalRepos={handleShowCriticalRepos}
        onShowReadyRepos={handleShowReadyRepos}
        onShowSafeSimulation={handleShowSafeSimulation}
        onShowTakeHomeScenario={handleShowTakeHomeScenario}
      />

      <div className="workspace-layout">
        <RepositoryList
          languageFilter={languageFilter}
          languageOptions={languageOptions}
          repositories={filteredRepos}
          repositoryCount={repositoryData.length}
          searchTerm={searchTerm}
          selectedRepoId={selectedRepo.id}
          statusFilter={statusFilter}
          onLanguageFilterChange={setLanguageFilter}
          onOpenRepo={handleOpenRepo}
          onSearchTermChange={setSearchTerm}
          onSelectRepo={handleSelectRepo}
          onStatusFilterChange={setStatusFilter}
        />

        <main className="main-grid">
          <RepositoryOverview
            isAgentActive={isActive}
            activeExecution={activeExecution}
            executionStatus={status}
            liveElapsedSeconds={liveElapsedSeconds}
            repository={selectedRepo}
            selectedTaskId={selectedTaskId}
            taskRunStates={taskRunStates}
            tasks={taskCatalog}
            onActivityAction={setSelectedTaskId}
            onRunAgent={handleRunAgent}
            onSelectTask={setSelectedTaskId}
          />

          <AgentExecutionPanel
            activeExecution={activeExecution}
            canRetry={canRetry}
            currentStep={currentStep}
            logs={logs}
            progress={progress}
            status={status}
            onOpenDetails={() => setIsDetailsOpen(true)}
            onRetry={retryAgent}
          />
        </main>
      </div>

      <DetailsDrawer
        execution={activeExecution}
        logs={logs}
        open={isDetailsOpen}
        status={status}
        onClose={() => setIsDetailsOpen(false)}
      />
      <RepositoryDetailWindow
        open={isRepoWindowOpen}
        repository={selectedRepo}
        onClose={() => setIsRepoWindowOpen(false)}
      />
    </div>
  );
}

export default App;
