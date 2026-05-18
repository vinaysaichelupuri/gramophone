# Module 1: Spec-Driven Development and OpenCode

> **Goal:** Understand the full Spec-Driven Development methodology — from vibe coding to structured specs — and learn how to run the SDD workflow using OpenCode and its agents.

---

## Module Overview

| Task | Type | Topic |
|---|---|---|
| Task 1.1 | Reading | From Vibe Coding to Structured Specs |
| Task 1.2 | Reading | What is Spec-Driven Development and Why It Scales |
| Task 1.3 | Reading | Context is King: Why Specs Improve AI Output |
| Task 1.4 | Reading | The SDD Workflow: Constitution → Specify → Clarify → Plan → Tasks → Implement |
| Task 1.5 | **ai-coding-playground** | **Setting Up SpecKit with the Specify CLI** |
| Task 1.6 | Reading | OpenCode Agents: Build, Plan, Explore, General |
| Task 1.7 | Reading | Running SDD Inside OpenCode |
| Task 1.8 | prompt-playground | Practice: Write Your First Spec |
| Task 1.9 | mcq | Check Your Understanding |

---

## Task 1.1: From Vibe Coding to Structured Specs
**Task Type:** Reading

---

You have probably used AI to generate code before. You open a chat, describe what you want, and the AI produces something. Sometimes it is good. Sometimes it needs fixing. Sometimes it confidently generates something that is completely wrong.

This approach is called **vibe coding** — you describe the vibe of what you want and hope the AI fills in the gaps correctly. It works for small, throwaway tasks. It breaks down fast for anything real.

## Why Vibe Coding Fails at Scale

When you vibe-code a feature, several things go wrong:

- **The AI invents requirements** — anything you did not specify, it guesses. Sometimes the guess is fine. Sometimes it is not what you needed at all.
- **You cannot validate the output** — if you never wrote down what "correct" looks like, how do you know the code is right?
- **Context disappears** — the next time you open a session, the AI has no memory. You explain everything again. From scratch. Every time.
- **Teams fragment** — two developers ask the AI the same question in different sessions and get different implementations. Nobody knows which one is right.

## The Shift: From Vibe to Structure

Spec-Driven Development solves all four problems by making one rule non-negotiable:

> **Write the spec before you write the code.**

A spec is not a design document that takes a week to produce. It is a focused Markdown file — typically one to two pages — that answers three questions before AI ever touches the keyboard:

1. **What** is being built?
2. **Why** does it need to exist?
3. **How** will we know it is done?

Once those three questions are answered in writing, AI moves from guesser to executor. The spec is the brief. The AI delivers against the brief. You validate against the brief. The brief never disappears.

---

## Task 1.2: What is Spec-Driven Development and Why It Scales
**Task Type:** Reading

---

Spec-Driven Development (SDD) is a methodology where every feature begins as a specification file — a structured Markdown document written before any code is generated.

The specification captures:
- **User stories and goals** — what the user needs and why
- **Functional requirements** — what the system must do, stated as testable behaviours
- **Data models** — the TypeScript interfaces and types the feature uses
- **UI requirements** — layout, states (loading/empty/error), and interactions
- **Edge cases** — every scenario where something could go wrong
- **Acceptance criteria** — the definition of done

## Why SDD Scales When Vibe Coding Does Not

| Situation | Vibe Coding | Spec-Driven Development |
|---|---|---|
| New session, same feature | Re-explain everything | Paste the spec — instant context |
| New team member | They read old chats trying to understand intent | They read the spec |
| Feature has a bug | Hard to know what "correct" was supposed to be | Check the spec |
| Feature needs extending | AI has no memory of previous decisions | Spec captures every decision |
| Multiple developers, same project | Inconsistent implementations | One spec, one source of truth |
| Changing AI models or tools | Context lost when switching | Spec is tool-agnostic |

## SDD is Tool-Agnostic

This is one of the most important properties of SDD. Your spec is a plain Markdown file. It works with any AI tool — OpenCode today, a different tool tomorrow. The spec outlives the tool.

> 💡 **Why this matters for your company:** As the internal AI platform evolves and models are upgraded, your specs remain valid. Nothing you built is tied to one model or one session.

## Specs Decouple the "What" from the "How"

A well-written spec describes **what** to build and **why** — but deliberately does not prescribe the technical stack. That comes later in a separate planning step. This separation means:

- Non-technical stakeholders can read and validate the spec
- The same spec can generate multiple implementations (React Native today, another framework later)
- Business requirements are versioned separately from technical decisions

---

## Task 1.3: Context is King — Why Specs Improve AI Output
**Task Type:** Reading

---

Every AI model has a context window — the amount of information it can hold in memory during a session. The quality of what you put into that context directly determines the quality of what comes out.

## What Happens Without a Spec

When you prompt an AI without a spec, the context window fills with:
- Your vague description of the feature
- The AI's interpretation of that description
- Back-and-forth clarification messages
- Partial code that may or may not reflect what you actually need

By the time you have explained enough for the AI to generate useful code, you have burned most of the context window on clarification rather than implementation.

## What Happens With a Spec

When you paste a spec into OpenCode, the context window fills with:
- Precise requirements the AI can check its output against
- Exact TypeScript interfaces — no type guessing
- Explicit edge cases — no assumptions
- A clear deliverable — the AI knows when it is done

The result is less back-and-forth, more accurate first-pass output, and faster iteration when fixes are needed.

## Context Compounds Across a Project

In a multi-sprint project like GramoPhone, context compounds. Each feature builds on the previous one. Without specs:

- The AI does not know how Sprint 3 relates to Sprint 1
- It may generate code that conflicts with decisions made three sessions ago
- You spend time re-explaining context that should have been captured in writing

With specs saved in your project's `/specs` folder, you can paste any previous spec into a new session and the AI immediately has the full history of decisions. **Specs are persistent context.**

## Specs vs. Custom Instructions

Custom instructions (like an `AGENTS.md` or `opencode.json` rules file) tell the AI how to behave — coding style, folder conventions, naming rules. They are always-on guardrails.

Specs tell the AI what to build — for a specific feature, right now.

They work together:

| | Custom Instructions / AGENTS.md | Spec File |
|---|---|---|
| **Scope** | Whole project, always active | One feature, one sprint |
| **Content** | Coding standards, architecture rules | Requirements, data models, edge cases |
| **Written by** | Team lead / architect once | Developer before each sprint |
| **Changes** | Rarely | Every sprint |

> 💡 **In OpenCode:** Run `/init` once in your project to generate an `AGENTS.md`. This becomes your custom instructions baseline. Your spec files layer on top of it for each feature.

---

## Task 1.4: The SDD Workflow
**Task Type:** Reading

---

SDD follows a structured six-stage pipeline. Each stage produces a file. Each file feeds the next stage. No stage is skipped.

```
CONSTITUTION → SPECIFY → CLARIFY → PLAN → TASKS → IMPLEMENT
```

---

### Stage 1: Constitution
**Command in OpenCode:** `/speckit-constitution` or describe it in the Plan agent

**What it produces:** `.specify/memory/constitution.md`

The Constitution is a set of **non-negotiable project principles** that every feature must follow. It is written once, at the start of the project, and every subsequent spec and plan is checked against it.

Think of it as the architectural DNA of the project. It answers:
- What tech stack is locked in? (e.g. React Native Expo, TypeScript)
- What are the coding standards? (e.g. functional components only, no class components)
- What are the structural rules? (e.g. every feature starts as a service before becoming a screen)
- What are the non-negotiables? (e.g. all Android permissions must use the permission service)

**Example Constitution entries for GramoPhone:**

```markdown
# GramoPhone Constitution v1.0

## Tech Stack (Non-Negotiable)
- Framework: React Native Expo (managed workflow)
- Language: TypeScript — strict mode, no `any`
- Navigation: expo-router only
- Audio: expo-av only — no other audio libraries

## Architecture Rules
- All business logic lives in /services — never directly in screens
- All TypeScript types live in /types — never inline
- All Android permissions must go through services/permissions.ts

## Code Standards
- Functional components only — no class components
- No inline styles — use StyleSheet.create
- Every screen must handle three states: loading, empty/error, populated

## Testing
- Edge cases must be handled in the service layer, not the UI layer
```

The Constitution is not a wish list. It is a gate. The AI must not violate it.

---

### Stage 2: Specify
**Command in OpenCode:** Describe the feature to the Plan agent

**What it produces:** `specs/[feature-name]/spec.md`

This is where you write what the feature does — in plain language, focused on **user goals and behaviour**, not technical implementation.

**The golden rule of specify:** Write what and why. Not how. The how comes in Stage 4.

```markdown
## Feature: Song Library

### Overview
Allow users to discover and browse all music files stored on their device.

### User Stories
- As a user, I want to see all songs on my device so I can choose what to play
- As a user, I want to see each song's title, artist, and duration
- As a user, I want to pull down to refresh the list

### Functional Requirements
1. Scan device storage for audio files on app launch
2. Display songs in a scrollable list
3. Each row shows: title, artist name, duration (MM:SS format)
4. Show a loading state while scanning
5. Show an empty state if no songs are found
6. Show an error state if scanning fails
7. Support pull-to-refresh

### Acceptance Criteria
- [ ] Songs appear within 3 seconds of app launch on a device with 100 songs
- [ ] Empty state is shown with a helpful message when no songs exist
- [ ] Tapping a song navigates to the Now Playing screen
```

Notice: no mention of React Native, TypeScript, FlatList, or AsyncStorage. That comes in Stage 4.

---

### Stage 3: Clarify
**Command in OpenCode:** Ask the Plan agent to review and question the spec

**What it produces:** An updated `spec.md` with ambiguities resolved

Clarify is the most underused stage in SDD. It is where the AI reads your spec and asks the questions **you did not know to ask**.

The biggest danger in specifications is **underspecification** — requirements you left out because you assumed the answer was obvious. It is not obvious to the AI. And once code is generated against an underspecified requirement, fixing it costs more time than clarifying it would have.

**How to run Clarify in OpenCode:**

Switch to the Plan agent (Tab) and ask:

```
Read specs/song-library/spec.md and identify every ambiguity,
missing requirement, or edge case I have not addressed.
Ask me specific questions to resolve each one.
```

**Example questions the AI might surface:**

- What happens when a song has no artist metadata? Should it show "Unknown Artist" or be hidden?
- What audio formats should be scanned? Only .mp3, or also .flac, .m4a, .wav, .ogg?
- Should the list be sorted by default? If yes, by what — title, artist, or date added?
- What happens if the user denies storage permission?
- Should the duration show as "3:45" or "3 min 45 sec"?

Each of these would have caused a bug or a wrong implementation if left unresolved. Clarify surfaces them before a single line of code is written.

> 💡 **The Rule:** Never move forward with a vague spec. Clarify first. It costs 5 minutes. Fixing wrong code costs hours.

---

### Stage 4: Plan
**Command in OpenCode:** Ask the Build or Plan agent to generate the technical plan

**What it produces:** `specs/[feature-name]/plan.md` and `specs/[feature-name]/data-model.md`

Now — and only now — does the technology enter the picture. The Plan stage takes the clarified spec and adds:

- **Tech stack decisions** — which libraries, which APIs
- **File structure** — exactly what files will be created or modified
- **Data models** — TypeScript interfaces
- **Architecture decisions** — how services connect to screens
- **Dependencies** — what must exist before this feature can be built

**How to run Plan in OpenCode:**

```
Read specs/song-library/spec.md. Generate a technical plan for
implementing this feature in our React Native Expo TypeScript project.
Follow the Constitution at .specify/memory/constitution.md.
Output plan.md and data-model.md inside specs/song-library/.
```

**Example plan.md output:**

```markdown
## Technical Plan: Song Library

### Files to Create
- types/Song.ts — Song interface
- services/scanner.ts — audio file scanning service
- screens/AllSongs.tsx — list screen

### Files to Modify
- app/(tabs)/index.tsx — wire to AllSongs screen

### Dependencies
- expo-file-system (already installed)
- react-native-fs (add to package.json)

### Data Model → see data-model.md
```

---

### Stage 5: Tasks
**Command in OpenCode:** Ask the Build agent to generate tasks from the plan

**What it produces:** `specs/[feature-name]/tasks.md`

The Task stage breaks the plan into a checklist of **small, atomic, independently implementable units of work** — each one a single coding action that can be done, tested, and marked complete on its own.

**Properties of a good task:**
- Completable in one OpenCode session
- Has a clear pass/fail condition
- Is ordered by dependency (data model before service, service before screen)
- Marked `[P]` if it can run in parallel with another task

**Example tasks.md:**

```markdown
## Tasks: Song Library

### Phase 1 — Data Foundation
- [ ] Create types/Song.ts with Song interface (id, title, artist, album, path, duration)
- [ ] Create types/PermissionStatus.ts type

### Phase 2 — Services (depends on Phase 1)
- [ ] Create services/permissions.ts — checkMusicPermission() function
- [ ] Create services/scanner.ts — scanForAudioFiles() function [P]
- [ ] Create services/metadata.ts — extractMetadata() with fallback [P]

### Phase 3 — Screen (depends on Phase 2)
- [ ] Create screens/AllSongs.tsx — FlatList with loading/empty/error states
- [ ] Wire tap handler to navigate to Now Playing screen
```

Tasks are the contract between you and the AI. Each task is one prompt. Each prompt produces one result. Each result is checked against the task before moving to the next.

---

### Stage 6: Implement
**Command in OpenCode:** Work through tasks.md one task at a time with the Build agent

**What it produces:** Working, tested code committed to the repository

Implementation is the final stage — and by this point, most of the hard thinking is already done. The spec defined what. The clarification removed ambiguity. The plan defined how. The tasks defined the order. The Build agent now has everything it needs to execute.

**How to implement in OpenCode:**

```
Implement this task from tasks.md:

[ ] Create types/Song.ts with Song interface
    Fields: id (string), title (string), artist (string),
    album (string | undefined), path (string), duration (number)

Follow the Constitution. Output to types/Song.ts.
```

After each task: test it. Check it against the spec. If it passes, tick it off and move to the next. If it fails, iterate before moving on — never carry a broken task forward.

---

## The Full SDD Pipeline — Summary

```
STAGE 1: Constitution   → .specify/memory/constitution.md
         Non-negotiable project rules. Written once.

STAGE 2: Specify        → specs/[feature]/spec.md
         What to build and why. No tech stack yet.

STAGE 3: Clarify        → Updated spec.md
         AI surfaces unknown unknowns. Resolve before coding.

STAGE 4: Plan           → specs/[feature]/plan.md + data-model.md
         How to build it. Tech stack, files, architecture.

STAGE 5: Tasks          → specs/[feature]/tasks.md
         Atomic checklist. One task = one OpenCode session.

STAGE 6: Implement      → Code, tested and committed
         Build agent executes tasks. Validate each one.
```

---

## Task 1.5: Setting Up SpecKit with the Specify CLI
**Task Type:** ai-coding-playground

---

Before you can use `/speckit.constitution`, `/speckit.specify`, `/speckit.clarify`, and the rest of the SDD commands inside OpenCode, you need to install SpecKit and register its agents with your project. This task walks you through the full setup from scratch.

## What SpecKit Installs

When you run `specify init`, it sets up the following inside your project:

```
.specify/
├── memory/
│   └── constitution.md          ← your project constitution lives here
├── scripts/                     ← bash/powershell automation scripts
└── templates/                   ← spec, plan, tasks templates
.opencode/
└── agents/                      ← speckit slash commands registered here
    ├── speckit-constitution.md
    ├── speckit-specify.md
    ├── speckit-clarify.md
    ├── speckit-plan.md
    ├── speckit-tasks.md
    ├── speckit-analyze.md
    └── speckit-implement.md
```

These agent files are what make `/speckit.constitution`, `/speckit.specify`, etc. available as slash commands inside OpenCode. Without this step, those commands do not exist.

---

## Step 1: Install Prerequisites

SpecKit's `specify` CLI requires **Python** and **uv** (a fast Python package manager).

### Check if you have Python

```bash
python3 --version
# Should print Python 3.8 or higher
```

If not installed, download from [https://python.org](https://python.org).

### Install uv

```bash
# Mac / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Verify:

```bash
uv --version
# Should print uv 0.x.x
```

---

## Step 2: Install the Specify CLI

```bash
# Recommended: persistent install
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Verify
specify --version
```

> 💡 **No `uv` available?** You can use a one-time install with `uvx` instead — replace `specify init` with `uvx --from git+https://github.com/github/spec-kit.git specify init` in any command below.

---

## Step 3: Initialise SpecKit in Your Project

Navigate to your project root (the GramoPhone folder) and run:

```bash
cd gramophone

specify init . --ai opencode
```

The `--ai opencode` flag tells SpecKit to install its agent slash commands in the `.opencode/agents/` folder — exactly where OpenCode looks for custom agents.

### What `specify init` does

- Creates the `.specify/` folder with memory, scripts, and templates
- Creates `.opencode/agents/` and installs all `/speckit.*` command files
- Creates an initial `.specify/memory/constitution.md` (empty, ready for you to fill)
- Detects your OS and installs the right script variants (bash or PowerShell)

You should see output like:

```
✅ Created .specify/memory/constitution.md
✅ Installed OpenCode agents in .opencode/agents/
✅ SpecKit ready — open OpenCode and type /speckit to see commands
```

---

## Step 4: Verify Inside OpenCode

Launch OpenCode in your project:

```bash
opencode
```

In the OpenCode chat, type `/speckit` and press Tab. You should see all available commands appear in the autocomplete menu:

```
/speckit.constitution   → Create project governing principles
/speckit.specify        → Define what you want to build
/speckit.clarify        → Resolve ambiguities in the spec
/speckit.plan           → Create a technical implementation plan
/speckit.tasks          → Generate an actionable task list
/speckit.analyze        → Cross-check all artifacts for consistency
/speckit.implement      → Execute tasks and generate code
```

If you see these commands, SpecKit is installed correctly. If you do not see them, check that the `.opencode/agents/` folder was created and contains the agent `.md` files.

---

## Step 5: Adding SpecKit to an Existing Project

If your project already has code and you are introducing SDD partway through, the same command works:

```bash
# Inside your existing project root
specify init . --ai opencode
```

SpecKit will add the `.specify/` folder without touching any of your existing files. You can then run `/speckit.constitution` to retroactively document your project's principles and start using SDD from that point forward.

> 💡 **Tip:** For existing projects, start with `/speckit.constitution` and describe the conventions already in use — not what you wish the project was, but what it actually is. This gives the AI accurate context immediately.

---

## Step 6: Commit SpecKit to Your Repository

The `.specify/` and `.opencode/agents/` folders should be committed so every team member on your company platform gets the same setup automatically:

```bash
git add .specify/ .opencode/
git commit -m "chore: add SpecKit SDD scaffolding"
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `specify: command not found` | Re-run `uv tool install specify-cli ...` and reload your terminal |
| `/speckit` commands not showing in OpenCode | Check `.opencode/agents/` folder exists and contains `.md` files |
| Git credential error on Linux | Install Git Credential Manager: `sudo dpkg -i gcm-linux_amd64.deb` |
| `specify init` fails with network error | Check your company network allows access to `github.com` |

---

## Your Challenge

Complete the following and confirm each step works before moving on:

1. **Install** `uv` and the `specify` CLI
2. **Run** `specify init . --ai opencode` inside the GramoPhone project folder
3. **Open** OpenCode and verify `/speckit` commands appear in autocomplete
4. **Ask the Build agent:** *"List all files that were created by specify init in this project"*
5. **Confirm** `.specify/memory/constitution.md` exists (it will be empty — you will fill it in Module 2)

---

## Task 1.6: OpenCode Agents — Build, Plan, Explore, General
**Task Type:** Reading



---

OpenCode does not have one AI mode — it has **agents**, each with different permissions and purposes. Using the right agent at the right stage of the SDD pipeline is the skill that separates fast, reliable development from frustrating back-and-forth.

## The Four Agents

---

### 📋 Plan Agent — Think Before You Build
**Mode:** Primary | **File access:** Read-only | **Switch with:** Tab

The Plan agent can read your project files but cannot write or modify them. It is designed for the thinking stages of SDD — Constitution, Specify, Clarify, and Plan — where you want analysis and feedback without any risk of accidental changes.

**Use Plan for:**
- Reviewing and questioning your spec (Stage 3: Clarify)
- Generating a technical plan from a clarified spec (Stage 4: Plan)
- Critiquing generated code without modifying it
- Asking "what could go wrong with this approach?"

```
[Plan agent — Tab to switch]

> Read specs/song-library/spec.md and identify every ambiguity or
  missing requirement. Ask me specific questions for each one.
```

---

### 🔨 Build Agent — Write the Code
**Mode:** Primary | **File access:** Full (read + write + bash) | **Default agent**

The Build agent is the default and has full access. It reads files, creates files, edits files, and runs terminal commands. This is the agent for Stages 5 and 6 — generating tasks and implementing them.

**Use Build for:**
- Generating the task list from plan.md (Stage 5: Tasks)
- Implementing each task (Stage 6: Implement)
- Running the project to check for errors
- Fixing bugs identified during testing

```
[Build agent — default or Tab to switch back]

> Implement this task:
  Create types/Song.ts with the Song interface.
  Fields: id, title, artist, album (optional), path, duration (number in seconds).
  File: types/Song.ts. Follow the Constitution.
```

---

### 🔍 Explore Agent — Find Without Touching
**Mode:** Subagent | **File access:** Read-only | **Invoke with:** @explore

The Explore agent is a fast, read-only subagent for navigating your codebase. It cannot modify files. Use it when you need to find something quickly — before writing a spec, before implementing a task, or before checking what already exists.

**Use Explore for:**
- Finding where a type or function is defined before referencing it in a spec
- Checking which files will be affected by a change
- Understanding how existing code is structured before adding to it

```
@explore find all files that reference PermissionStatus in this project
```

```
@explore where is the Song interface currently defined?
```

---

### ⚙️ General Agent — Research and Implement Together
**Mode:** Subagent | **File access:** Full | **Invoke with:** @general

The General agent is a powerful subagent for multi-step tasks that combine research and implementation. Use it when you need to look something up and act on it in the same session.

**Use General for:**
- Researching an unfamiliar API and implementing a basic version
- Running multiple units of work in a single prompt
- Tasks that require external knowledge plus file changes

```
@general research how expo-av handles audio focus on Android when
another app starts playing, then add the appropriate audio focus
handling to services/playback.ts
```

---

## Agent × SDD Stage Map

| SDD Stage | Best Agent | Why |
|---|---|---|
| Constitution | Plan | Think through principles without writing code yet |
| Specify | Plan | Draft and refine the spec safely |
| Clarify | Plan | Surface gaps without making changes |
| Plan | Plan → Build | Plan to analyse, Build to write plan.md |
| Tasks | Build | Generate tasks.md from plan.md |
| Implement | Build + @explore | Build writes code, @explore checks what exists first |

---

## Task 1.7: Running SDD Inside OpenCode
**Task Type:** Reading

---

Here is the exact sequence you will follow for every sprint in this course, using OpenCode agents.

## Sprint Setup (One Time Per Project)

```bash
# 1. Navigate to your project
cd gramophone

# 2. Launch OpenCode
opencode

# 3. First time only: initialise AGENTS.md
/init
```

`/init` scans your project and generates an `AGENTS.md` file — OpenCode's equivalent of custom instructions. This file tells every agent about your project structure, conventions, and rules. Run it once. Commit it.

## The Sprint Sequence (Every Feature)

### Step 1 — Clarify scope with Plan agent
Press **Tab** to switch to the Plan agent. Describe the feature you are about to build. Ask it to help you think through what the spec needs to cover.

```
[Plan agent]
> I am about to write a spec for the song scanning service.
  What questions should I answer in the spec to make sure
  the implementation is complete and unambiguous?
```

### Step 2 — Write the spec file
Open your editor, create `specs/[feature-name]/spec.md`, and write the spec. Use the template from Task 1.5. Focus on what and why — not how.

### Step 3 — Run Clarify
Back in the Plan agent, paste your spec and ask it to find the gaps.

```
[Plan agent]
> Read this spec and ask me the questions I did not think to ask:
  [paste spec.md content]
```

Update your spec with the answers. Repeat until the Plan agent finds no more ambiguities.

### Step 4 — Generate the technical plan
Still in Plan (or switch to Build if you want it written to a file):

```
[Build agent]
> Read specs/song-scanner/spec.md and generate a technical plan.
  Follow .specify/memory/constitution.md.
  Output plan.md and data-model.md to specs/song-scanner/.
```

### Step 5 — Generate tasks
```
[Build agent]
> Read specs/song-scanner/plan.md and break it into an atomic
  task list. Order tasks by dependency. Mark parallel tasks with [P].
  Output to specs/song-scanner/tasks.md.
```

### Step 6 — Implement task by task
Work through `tasks.md` one task at a time. For each task:

```
[Build agent]
> Implement this task:
  [paste the single task from tasks.md]
  Reference: specs/song-scanner/spec.md
  Constitution: .specify/memory/constitution.md
```

After each task: test on your simulator. Tick it off in tasks.md. Move to the next.

### Step 7 — Commit everything
```bash
git add specs/ src/
git commit -m "feat: song scanner — spec + implementation"
```

The spec files are committed alongside the code. Always.

---

## Task 1.8: Practice — Write Your First Spec
**Task Type:** prompt-playground

---

## Your Challenge

Below is a rough feature idea — the kind of thing a product manager or team lead might say in a meeting. Your job is to turn it into a proper SDD spec.

**The idea:**
> *"We need a way for users to mark songs they like so they can find them again easily. It should work from the song list and from the now-playing screen. Likes should still be there when you close and reopen the app."*

**Write a spec for this feature using the template below. Then write the OpenCode prompt you would use in the Plan agent to clarify it.**

### Spec Template

```markdown
## Feature: [Name]

### Overview
[One or two sentences: what it does and why]

### User Stories
- As a user, I want to...

### Functional Requirements
1.
2.
3.

### Data Models
[TypeScript types/interfaces]

### UI Requirements
- States: loading / empty / populated
- Interactions:

### Edge Cases
-
-

### Acceptance Criteria
- [ ]
- [ ]

### Deliverable
[One sentence: what exists and works when done]
```

**After writing the spec, write the Plan agent prompt you would use to clarify it.**

> 💡 **Tip:** Good clarification prompts are specific. Instead of "check my spec", try: *"Read this spec and ask me one question for each requirement that has an unstated assumption or a missing edge case."*

---

## Task 1.9: Check Your Understanding
**Task Type:** mcq

---

**Question 1**

What is the main problem with "vibe coding" when building real features?

- [ ] It is too slow — AI takes too long to respond
- [x] **The AI invents missing requirements, output is hard to validate, and context disappears between sessions**
- [ ] It works fine for most features
- [ ] AI cannot generate code without a spec

---

**Question 2**

In the SDD pipeline, the Specify stage says to write what and why — but NOT how. What does "not how" mean in practice?

- [ ] You do not need to write acceptance criteria
- [ ] You should not write user stories
- [x] **You describe the feature's behaviour without mentioning the tech stack, libraries, or file structure — those come in the Plan stage**
- [ ] You only write one requirement per spec

---

**Question 3**

You have written a spec for the song scanning service. Before moving to the Plan stage, what should you do?

- [ ] Ask the Build agent to generate code immediately — the spec is enough
- [ ] Skip to Tasks and come back to Clarify later if bugs appear
- [x] **Run the Clarify stage — ask the Plan agent to find ambiguities and missing edge cases in the spec**
- [ ] Commit the spec and start a new session

---

**Question 4**

You want to check whether a `PermissionStatus` type already exists in the project before writing your spec. Which agent do you use and why?

- [ ] Build — it has full access and can search quickly
- [ ] Plan — it is safer for read-only tasks
- [x] **@explore — it is a fast read-only subagent built specifically for codebase navigation**
- [ ] @general — it can research and report back

---

**Question 5**

What is the difference between the Constitution and a spec file?

- [ ] They are the same thing — constitution is just another name for the spec
- [ ] The constitution is written per sprint; the spec is written per project
- [x] **The constitution sets non-negotiable project-wide rules written once; the spec defines one feature's requirements written before each sprint**
- [ ] The spec is committed; the constitution is not

---

**Question 6**

Why do you commit spec files alongside code in every sprint?

- [ ] The Build agent requires spec files to be in the repo to function
- [ ] It satisfies Git best practices but has no practical benefit
- [x] **Specs are persistent context — they are documentation, test criteria, and future AI session input all in one file**
- [ ] So that the Plan agent can find them in future sessions automatically

---

### ✅ Module 1 Complete

Before moving to Module 2, confirm all of the following:

- [ ] I understand why vibe coding breaks at scale and what SDD solves
- [ ] I can name and explain all six stages: Constitution → Specify → Clarify → Plan → Tasks → Implement
- [ ] I know what each stage produces (which file) and what it feeds into
- [ ] I know the difference between the Plan agent and the Build agent — and when to use each
- [ ] I can invoke @explore and @general subagents and know when each is appropriate
- [ ] I understand that specs decouple "what" from "how" — Specify has no tech stack
- [ ] I have written a spec using the template in Task 1.7
- [ ] I understand the Constitution as a non-negotiable gate, not a style guide

---

**Next → Module 2: Write the Phase 1 Constitution and Spec, Then Implement It**
