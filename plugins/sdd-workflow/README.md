# SDD Workflow Plugin

This plugin defines two SDD-focused skills:

1. `sdd-architect`: Creates an implementation plan from requirements.
2. `sdd-developer`: Implements code by following an approved plan.

## Suggested usage

1. Ask for planning:
   - `Use $sdd-architect to create an implementation plan for <feature>.`
2. Approve/refine the plan.
3. Ask for implementation:
   - `Use $sdd-developer to implement the approved plan in this repo.`

## Plan artifact convention

When you want persistent plans, store them at:

- `docs/sdd/plans/YYYY-MM-DD-<topic>.md`
