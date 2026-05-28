# AI Agent Instructions for Sales Brain AI Workspace

## Project Overview
This repository contains "Sales Brain AI" - a full-stack JavaScript application leveraging a Vite + React (TypeScript) frontend and an Express/Node.js backend (`server.ts`). It heavily incorporates the Gemini API (`@google/genai`).

## Development Commands
- **Install**: `npm install`
- **Run Locally (Dev)**: `npm run dev` (Starts the Express backend and Vite frontend via `tsx`).
- **Build**: `npm run build`
- **Start (Prod)**: `npm run start` (Runs the compiled `dist/server.cjs`).
- **Lint**: `npm run lint`

## Terminal Constraints (CRITICAL)
- **PowerShell Environment**: The primary shell is Windows PowerShell.
- **NO Bash Syntax**: Do not use Bash features like `cat << 'EOF' > file`, heredocs, or typical Unix utilities unless they are proven cross-platform npm scripts.
- **File Manipulation Priority**: Avoid piping complex strings or using `node -e "..."` with escaped quotes in the terminal. Always prefer using the agent's internal `create_file` or `edit_file` tools to generate local scripts (e.g. `script.cjs`), run them via `node script.cjs`, and then remove them.
- **Unicode & UTF-8 Protection**: NEVER inject Unicode (e.g., Burmese text) into a PowerShell command string. It will result in corrupted characters (`?????`). Rely entirely on file I/O tools to safely write UTF-8 arrays and JSON.

## Localization & i18n Guardrails
- **Manual Confirmations**: The user prefers to provide or confirm translated content (especially Burmese) before it gets systematically applied.
- **Strict Scope for `t()`**: NEVER invoke a `t()` translation function inside helper/utility functions declared outside a React component. Doing so resolving to undefined causes fatal white screens. Always pass `t` explicitly as a function argument.
- **Key Conventions**: ALWAYS use the exact English string as the translation key (e.g., `t("Client Customer")`). No nested, dot-notated, or snake_case keys.
- **Regex Safety**: If renaming or replacing calls to `t`, use strict word boundaries (`\bt\b`) to avoid corrupting unrelated component properties (like `draft.title`).

