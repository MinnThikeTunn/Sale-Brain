# 🤖 Agent Guardrails & Architectural Lessons

> **Purpose:** This document serves as a critical, living reference for AI coding agents working on this codebase. It captures documented anti-patterns, proven solutions, and architectural lessons learned from past debugging sessions. By feeding this file into an agent's context window or referencing it in system prompts, you prevent the agent from repeating the same technical mistakes.
>
> **How to Use:** 
> - Before generating schema designs, database migrations, or API route logic, review this file.
> - If you encounter a new issue, document it here using the standardized format.
> - Use absolute rules and explicit patterns—agents parse structured text much better than loose narratives.

---

## [ISSUE-001]: [Next Issue Title]
* **Context:** [Brief description of the scenario where the issue occurred.]
* **Anti-Pattern (DO NOT DO):** [What approach failed or caused the problem.]
* **The Error Triggered:** [Specific error message or consequence.]
* **The Correct Pattern (DO THIS):** [The proven solution pattern.]
* **Enforcement Rule:** [When to apply this rule—under what conditions must this pattern be followed?]

---

## 🚀 Quick Reference Rules

### Schema Validation
- **Rule:** Use strict polymorphic safety with `oneOf` blocks for distinct roles.
- **Rule:** Use `enum` for constants instead of loose strings.
- **Rule:** Nullable strings or numbers must use type arrays `[...]` (e.g., `string[] | null`).

### API Design
- **Rule:** [To be added as issues are documented.]
- **Rule:** [To be added as issues are documented.]

### Database
- **Rule:** [To be added as issues are documented.]
- **Rule:** [To be added as issues are documented.]

---

## 📋 Issue Log

| Issue # | Title | Date Added | Status |
|---------|-------|------------|--------|
| ISSUE-001 | [Title] | YYYY-MM-DD | [Active/Resolved] |

---

## 🔄 Continuous Injection Loop

```
[Agent Makes Error] ──> [Debug/Fix It] ──> [Append to Lesson-learned.md]
                                                       │
                                                       ▼
[Next Agent Task]   <── [Agent Reads File]   <── [Updated Rules Context]
```

---

## 📝 Contribution Guidelines

When adding a new lesson:

1. **Use the standardized format** (copy the ISSUE-001 template above).
2. **Be specific** — include actual error messages and code snippets where possible.
3. **Provide enforcement rules** — make it clear when this rule applies.
4. **Use absolute language** — "MUST", "DO NOT", "ALWAYS" rather than "try to avoid".
5. **Categorize** — Add to appropriate section (Schema Validation, API Design, Database, etc.).

---

*Last Updated: YYYY-MM-DD*
*Maintained by: [Team Name / Lead Developer]*