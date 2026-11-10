# Agent Execution Playbook (`AGENTS.md`)

## 1. Project Scope & Architecture Constraints
- **Scope Limit:** Frontend-only React application using static fictional room data.
- **Forbidden Features:** Do NOT add backend databases, server integrations, user authentication, or login forms.
- **Data Policy:** Do NOT add real personal information (PII), API keys, or production secrets.
- **Deployment Limit:** Do NOT configure external production deployments or remote cloud hosting integrations.

## 2. Protected Code Boundaries
- **Core Rules (AC1–AC6):** Do NOT modify, rewrite, or loosen the core availability validation rules in `src/availability.ts`.
- **File Structure:** Maintain modular separation between data (`src/data.ts`), UI presentation (`src/components/`), and logic (`src/availability.ts`).

## 3. Mandatory Pre-Acceptance Verification
Before proposing any code changes or accepting pull requests:
1. Execute `npm run test` and verify that all unit tests pass with exit code 0.
2. Execute `npm run lint` and `npm run build` to ensure type-checking and linting succeed without compilation errors.
