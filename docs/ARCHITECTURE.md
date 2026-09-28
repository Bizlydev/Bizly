# Bizly — Architecture

## Client
- Expo and React Native with Expo Router for navigation.
- TypeScript for shared types and application logic.
- Localization dictionaries live in `locales/` (`fa`, `en`, `ar`). Keep keys consistent across languages.

## Backend
- Supabase provides authentication, PostgreSQL data, and row-level security (RLS).
- Keep service-role credentials out of the mobile app and repository. Use only client-safe configuration in the app.
- Enforce workspace membership and role permissions in database policies, not only in the UI.

## Core product areas
- Authentication and workspace selection
- Dashboard and sales
- Customers, debts, and payments
- Employees, tasks, and work hours
- Reports, notifications, and settings

## Implementation notes
- Preserve the `main` branch until the feature branch is reviewed and tested.
- Add database migrations and tests alongside backend changes.
