# Hotel Frontend Codex Context Pack

Put these files inside your frontend project.

Recommended placement:

```txt
frontend/
  AGENTS.md
  docs/
    BACKEND_FRONTEND_CONTEXT.md
    DESIGN_SYSTEM.md
    CODEX_PROMPT_TEMPLATE.md
```

## How to use

1. Put `AGENTS.md` in the root of your frontend project.
2. Put the `docs` folder inside the frontend project.
3. When sending a task to Codex, tell it:

```txt
Before starting, read AGENTS.md and the docs folder.
```

4. Then paste the specific task prompt.

## Why these files exist

These files help Codex remember:

- Your backend is Spring Boot
- The backend is the source of truth
- The roles are ADMIN, HOTEL_MANAGER, CUSTOMER
- The frontend should not invent endpoints
- The chosen palette is calm luxury hotel style
- The app should use protected routes, React Query, validation, loading/error/empty states, and toasts

## Best workflow

Do the tasks in order:

1. Project setup
2. Routing/layouts
3. Auth
4. Protected routes
5. Homepage
6. Search
7. Hotel details
8. Booking checkout
9. Payment
10. My bookings
11. Manager hotels
12. Manager rooms
13. Manager bookings
14. Admin dashboard
15. Saved hotels
16. Reviews
17. Profile
18. UI polish
