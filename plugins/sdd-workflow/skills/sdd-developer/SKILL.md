---
name: sdd-developer
description: Implement approved SDD plans by executing phased code changes, running verification, and reporting outcomes against the plan. Use when an implementation plan already exists and coding should follow that plan with minimal deviation.
---

# SDD Developer

Implement code from an approved SDD plan and produce an execution report mapped to plan phases.

Read `references/execution-report-template.md` and use its structure for output.

## Workflow

1. Confirm inputs:
- Require a plan artifact (inline or file path).
- If plan is missing, stop and request architect output.

2. Map work before editing:
- Translate each plan phase into concrete code tasks.
- Identify target files and tests before changing code.

3. Implement in sequence:
- Complete one phase at a time.
- Keep changes scoped to the current phase.
- Update or add tests with each phase.

4. Validate:
- Run lint/typecheck/tests that the plan requires.
- Record command results and unresolved failures.

5. Report completion:
- Mark each plan phase as done/partial/blocked.
- List exact file changes and verification evidence.

## Rules

- Follow the plan strictly; do not redesign architecture unless blocked.
- If a plan step is unsafe or impossible, pause and return a `Plan Divergence` note with options.
- Keep unrelated refactors out of scope.
- Preserve existing user changes; do not revert unrelated edits.

## Allowed Plan Divergence

Deviate only when at least one applies:
- The plan is technically invalid in the current codebase.
- New constraints appear (dependency/API/platform limit).
- The plan misses a required test or safety step.

When diverging, include:
- Why the original step fails
- Proposed alternative
- Impact on timeline and risk

## Output Contract

Return a concise execution report in Markdown using `references/execution-report-template.md`.
