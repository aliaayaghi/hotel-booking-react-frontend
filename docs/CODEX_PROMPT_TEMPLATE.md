# Codex Prompt Template

Use this template when sending tasks to Codex.

Replace the task section with the specific task you want Codex to do.

```txt
You are working on a React frontend for a Spring Boot Hotel Booking System backend.

Before starting, read these files:
- AGENTS.md
- docs/BACKEND_FRONTEND_CONTEXT.md
- docs/DESIGN_SYSTEM.md

Important project rules:
- The backend ZIP is the source of truth.
- Do not invent endpoints.
- If something is unclear, mark it as needs backend verification.
- Use the calm luxury hotel design palette.
- Only work on the exact task below.
- Do not build future tasks early.
- Do not rewrite unrelated files.

Chosen design palette:
Primary #1F2937 deep charcoal
Secondary #C9A227 muted gold
Background #F8F6F1 warm off-white
Card #FFFFFF
Text #111827
Accent #8B7355

Task:
[PASTE THE CURRENT SMALL TASK HERE]

Files to create/edit:
[LIST FILES HERE]

Testing:
At the end, explain how to run and test the result.

Final response:
Please summarize:
1. What changed
2. Files created/edited
3. How to run
4. How to test
5. Any backend verification needed
```
```

## Small reusable add-on for any prompt

Paste this at the end of any Codex prompt:

```txt
Reminder:
Use the calm luxury hotel style:
Primary #1F2937, Secondary #C9A227, Background #F8F6F1, Card #FFFFFF, Text #111827, Accent #8B7355.

Do not invent backend endpoints.
Use React Query for API data when needed.
Use loading, error, and empty states for data pages.
Use toast messages for success/error actions.
Keep the task small and do not touch unrelated files.
```
