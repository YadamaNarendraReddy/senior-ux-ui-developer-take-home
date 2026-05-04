# Agentic Developer Portal

An AI-native developer portal prototype for repository triage, agent task execution, and real-time automation monitoring.

This project was built as a senior UX/UI take-home exercise. It demonstrates how a developer can select a repository, understand its operational health, trigger an AI agent workflow, and inspect the run output through live logs, retry handling, repository details, and execution artifacts.

The experience is intentionally designed as a real developer operations console rather than a marketing surface. It prioritizes fast scanning, explicit actions, trustworthy automation feedback, and responsive behavior across desktop, laptop, tablet, Android, and iOS screen sizes.

## Executive Summary

The portal models a practical internal developer workflow:

1. Select a repository from a searchable, filterable repository list.
2. Review repository metadata, health, activity, risk, and readiness.
3. Choose an AI agent task.
4. Run the agent through a simulated backend workflow.
5. Watch real-time status, progress, and streaming logs.
6. Inspect detailed results, mandatory repository actions, artifacts, and retry outcomes.

The implementation uses React, TypeScript, Vite, modular components, public GitHub metadata, offline mock fallback data, and simulated agent execution.

## Deliverables

### UX Design

- Low/mid-fidelity wireframes: [docs/wireframes.md](docs/wireframes.md)
- UX decision write-up: [docs/ux-rationale.md](docs/ux-rationale.md)
- Embedded wireframe assets:
  - [Desktop workflow wireframe](docs/assets/wireframe-desktop-workflow.svg)
  - [Execution details and responsive wireframe](docs/assets/wireframe-responsive-detail.svg)

### Frontend Implementation

- React + TypeScript application
- Mock data and public GitHub metadata integration
- Simulated streaming agent execution
- Failure and retry flow
- Repository detail popup with direct repository links
- Responsive, corporate-level UI styling

## Wireframe Preview

![Desktop workflow wireframe](docs/assets/wireframe-desktop-workflow.svg)

![Execution details and responsive wireframe](docs/assets/wireframe-responsive-detail.svg)

## Product Scope

### Repository Selection

The left panel is the entry point for the workflow.

Capabilities:

- Search repositories by name, owner, description, or technology.
- Filter by repository health status.
- Filter by language.
- Select a repository without leaving the page.
- Open a repository detail popup using a separate `Open repository` action.
- Open the public GitHub repository from the popup using `Open direct repository`.

The selection behavior is intentionally separated from navigation. Clicking the repository card selects it. Opening repository details is a separate explicit action.

### Repository Overview

The center panel helps the developer decide what action to take.

It includes:

- Repository identity and description.
- A single top-level `Run Agent Task` button.
- Metadata strip with language, framework, PR count, stars, success rate, data source, and last commit.
- Selected repository value cards.
- Metrics for CI status, test coverage, success rate, security, and agent readiness.
- Repository insights.
- Clickable recent activity.
- Agent task cards.
- Live task timing.

Task timing behavior:

- Every task starts at `0 min`.
- The active task updates live while the agent is running.
- Only the completed or failed task keeps its measured runtime.
- Other tasks remain at `0 min` until they are run.

### Agent Execution

The right panel behaves like a live run console.

It includes:

- Idle, pending, running, success, and failure states.
- Real-time progress.
- Current execution step.
- Streaming logs.
- Attempt count.
- Retry support.
- Failure panel.
- Details drawer.

The execution is simulated, but it is structured like a real backend workflow so reviewers can evaluate the product interaction without requiring GitHub authentication or write access.

## Agent Workflow

When `Run Agent Task` is clicked, the agent simulation runs a full project-level workflow for the selected repository.

Mandatory workflow steps:

- Fork repository
- View dependencies
- High-level scan
- Run tests
- Refactor code
- Upgrade dependencies
- Create PR request

The Details drawer exposes these as structured results in two sections:

- `Mandatory repository actions`
- `Full agent workflow results`

This makes the automation transparent and reviewable, which is critical for agentic developer tools.

## Failure And Retry Scenario

One repository is modeled as a basic data repository using a free Titanic dataset reference from Kaggle/DataScienceDojo.

Failure behavior:

- The first run fails in the middle during dataset validation.
- The failure panel appears in the execution console.
- The failed task card keeps its measured runtime and shows a failed state.
- Other task cards remain at `0 min`.
- Retry reruns the same workflow and completes successfully.

This demonstrates realistic recovery behavior instead of only showing a happy path.

## Data Strategy

The app uses a hybrid data model.

### Live GitHub Metadata

When network access is available, the app fetches public metadata for:

- `facebook/react`
- `vitejs/vite`
- `microsoft/TypeScript`
- `fastify/fastify`
- `datasciencedojo/datasets`
- `vercel/next.js`

Live fields include:

- Repository name
- Owner
- Description
- Default branch
- Stars
- Open PR count
- Open issue count
- Contributors
- Last commit
- Public repository URL

### Demo Health Profiles

The repository portfolio is intentionally balanced:

- 2 healthy repositories
- 2 repositories needing attention
- 2 critical repositories

This gives reviewers a complete set of states to evaluate: success, warning, critical, failure, retry, and recovery.

### Offline Fallback

If GitHub API requests fail, the app falls back to local mock data from [src/data/mockData.ts](src/data/mockData.ts).

The fallback data includes:

- Public repository URLs
- Health profiles
- Task recommendations
- Execution metadata
- Dataset reference
- Recent activity

The app remains fully reviewable offline.

## UX Rationale

The design follows a developer operations model:

- Keep repository selection persistent.
- Make repository health visible before action.
- Use one primary run action to reduce accidental automation.
- Separate repository selection from repository opening.
- Show agent progress with logs and state transitions.
- Treat failure as a first-class workflow.
- Make details inspectable without leaving the current context.
- Keep responsive behavior predictable across screen sizes.

More detailed reasoning is available in [docs/ux-rationale.md](docs/ux-rationale.md).

## Architecture

```text
src/
  App.tsx
    Application state, selected repository/task, timing state, and layout composition

  components/
    Header.tsx
      Top portal navigation and quick scenario controls

    RepositoryList.tsx
      Search, filters, repository selection, and open-repository action

    RepositoryOverview.tsx
      Repository hero, metadata, insights, metrics, activity, and agent tasks

    TaskPicker.tsx
      Selectable agent task cards with live runtime state

    AgentExecutionPanel.tsx
      Live execution status, progress, logs, failure, details, and retry

    DetailsDrawer.tsx
      Run details, mandatory actions, workflow results, artifacts, timeline, dataset info

    RepositoryDetailWindow.tsx
      Repository detail popup with close and direct repository open actions

    StatusPill.tsx
      Shared status and risk indicator

  hooks/
    useAgentExecution.ts
      Simulated backend run engine, logs, status transitions, failure, retry, artifacts

  services/
    githubRepositoryService.ts
      Public GitHub metadata loading and fallback profile mapping

  data/
    mockData.ts
      Offline repository data and task catalog

  utils/
    format.ts
      Number, percent, date, status, risk, and runtime formatting

  styles.css
    Responsive corporate UI system

  types.ts
    Shared TypeScript models
```

## Technical Stack

- React 18
- TypeScript
- Vite
- CSS
- lucide-react icons
- Public GitHub REST API

## Responsive Design

The interface is designed for:

- Large desktop monitors
- Windows laptops
- MacBook-width screens
- Tablets
- Android phones
- iPhones

Responsive techniques:

- CSS custom properties for layout dimensions.
- `clamp()` for fluid spacing and sizing.
- `svh` viewport units for mobile browser compatibility.
- `auto-fit` and `minmax()` grid behavior.
- Scrollable repository, overview, execution, and detail surfaces.
- Reduced-motion support through `prefers-reduced-motion`.

## Accessibility And Interaction

- Semantic buttons and form controls.
- Visible keyboard focus states.
- Clear hover and active states.
- `aria-live` execution status updates.
- Separate actions for selection and navigation.
- Responsive text wrapping and overflow protection.
- Scrollable panels to avoid clipped content.

## Run Locally

### Prerequisites

Node.js:

```text
^20.19.0 or >=22.12.0
```

### Install

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Review Script

Use this flow when evaluating the project:

1. Open the app.
2. Search and filter repositories.
3. Select a healthy, attention, and critical repository.
4. Click `Open repository` on a repo card.
5. In the popup, use `Close` and `Open direct repository`.
6. Review repository health, metadata, insights, activity, and agent readiness.
7. Select an agent task.
8. Click the single top-level `Run Agent Task` button.
9. Watch task timing update live in the Agent Actions section.
10. Watch the execution console stream logs.
11. Open Details after completion or failure.
12. Review mandatory actions, full workflow results, artifacts, and timeline.
13. Run the basic data repository to see the first-attempt failure.
14. Retry the failed run and verify successful recovery.
15. Resize the browser to validate responsive behavior.

## Verification

The project has been verified with:

```bash
npm run build
```

The build runs TypeScript checks and creates a production Vite bundle.

