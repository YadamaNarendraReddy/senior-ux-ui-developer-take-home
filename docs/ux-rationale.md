# UX Rationale

## Product Framing

The portal is designed for developers, platform engineers, and service owners who need to move from repository triage to safe automation quickly. The experience is intentionally framed as an operational developer console rather than a landing page. A real user in this context already understands repositories, pull requests, CI, dependency drift, security findings, and test suites, so the interface prioritizes scanability, action clarity, and trust in automation.

The workflow answers four practical questions:

1. Which repository am I working on?
2. What is the current health and risk profile of that repository?
3. Which AI agent action is appropriate?
4. What is the agent doing right now, and what happened after it finished?

## Workflow Structure

The layout uses a three-pane desktop model because it matches how engineering teams often work in dashboards and CI systems. The left repository panel stays persistent so users can search, filter, and switch context without losing the larger workflow. Repository selection and repository detail opening are separated: clicking the card selects the repository, while the explicit `Open repository` action opens the detail window. Inside that window, `Close` returns to the portal and `Open direct repository` opens the real public repository link. This prevents accidental context jumps and makes navigation predictable.

The center pane holds decision-making context. It starts with the selected repository identity and the single primary `Run Agent Task` button. Placing the main action at the top gives the user one clear launch point instead of repeating the same command throughout the page. Under that, the metadata strip, value cards, metrics, insights, and activity list create a compact picture of repository health. The task cards sit inside the Agent Actions section and behave like a selectable control group, letting the user choose between running tests, scanning security, creating a pull request, upgrading dependencies, or refactoring code.

The right execution panel behaves like a live console. Developers expect long-running automation to show state transitions and logs, so the panel moves through idle, pending, running, success, and failure. Progress, current step, run attempt, and logs are always visible. Agent task timing starts at zero, updates live only for the active task, and preserves the measured result only for the task that completed or failed. When a run fails, the retry action appears in the same area where the developer is already watching the failure.

## Agent Trust And Transparency

Agentic developer tools need to show their work. The UI avoids treating the agent like a black box by exposing the steps it is taking: reading the repository, preparing a fork, viewing dependencies, scanning the repository, planning upgrades, preparing refactor notes, running tests, and creating a draft PR request. The details drawer provides deeper evidence after the run, including mandatory repository actions, full workflow results, runtime, repository scope, execution suites, artifacts, timeline, and dataset information when a basic data repo is selected.

Failure is intentionally included. One repository is modeled as a basic data repository using a free Titanic dataset reference. Its first agent run fails during dataset validation, then succeeds on retry. This gives reviewers a realistic recovery path and demonstrates how the product handles imperfect automation, not just happy-path completion.

## Visual And Interaction Decisions

The visual style is corporate and tool-focused. Cards use modest radius, restrained shadows, and clear status color: blue for primary action, green for healthy/success, amber for attention, and red for critical/failure. The design avoids decorative marketing patterns and focuses on alignment, readable hierarchy, and visible component boundaries.

The task and repository cards include hover and focus states because nearly every surface is actionable. Native controls are used for search and filters where possible, and iconography supports recognition without replacing text labels. Status pills are compact but consistent, making repository health easy to compare across the list, overview, and execution details.

## Responsiveness

The desktop experience is a three-pane console. On smaller screens, the layout stacks into repository selection, overview, agent actions, and execution. This keeps the workflow usable on Windows laptops, tablets, Android phones, and iPhones without horizontal scrolling. CSS variables, `clamp()`, `minmax()`, `auto-fit`, and `svh` units are used so panels and cards adapt to screen size while preserving enough height for internal content.

Scrollable regions are applied where the user expects them: repository list, overview content, execution logs, detail drawer, and repository detail window. This prevents content from being clipped while keeping each workflow area understandable.

## Implementation Fit

The UI is implemented with modular React + TypeScript components. Mock task data and repository health profiles are separated from presentation code, while the GitHub service can fetch public repository metadata when available. The simulated agent execution lives in a custom hook, which keeps timing, logs, retry behavior, failure handling, and artifacts isolated from the visual components.

This structure is intentionally understandable for a beginner while still resembling a real production codebase: data, types, services, hooks, components, and styling each have clear ownership.
