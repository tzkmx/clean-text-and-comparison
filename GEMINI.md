# Gemini Session Context

This document provides essential context for AI assistants to maintain consistency and adhere to project standards in future sessions.

## 1. Core Objective

The project's goal is to evolve a simple CLI tool for text cleaning and comparison into a robust, multi-interface, event-driven application. The system should be modular, scalable, and maintainable.

## 2. Key Documents for Context

Before starting any task, review the following documents to understand the project's standards, architecture, and strategic direction:

1.  **`dev_standards.md`**: This is the **single source of truth for development practices**. It outlines the "Always Works™" philosophy, the 30-Second Reality Check, and mandatory testing protocols. All code changes must adhere strictly to these standards.

2.  **`ARCHITECTURE.md`**: This document contains the full architectural plan and strategic vision. It details:
    *   The initial state of the application.
    *   The phased plan for evolving the CLI into a modular Express.js API with Markdown-based event sourcing.
    *   A comparative analysis of this approach versus a more advanced Nest.js CQRS/Event Sourcing architecture.
    *   The **recommended strategic path**, which is a phased migration from the Express.js implementation to the Nest.js architecture.

3.  **`ROADMAP-*.md` files**: These provide detailed, step-by-step guides for the migration and evolution of the application.

## 3. Summary of Strategic Path

The agreed-upon strategy is a phased evolution to manage complexity while delivering value incrementally:

1.  **Phase 1 (Current Goal):** Refactor the existing Node.js script into a modular core, an Express.js API, and a CLI that consumes the core module. Implement a simple, Markdown-based event store.
2.  **Phase 2 (Evolution):** Prepare for the next stage by migrating the codebase to TypeScript.
3.  **Phase 3 (Adoption):** Introduce Nest.js in a hybrid mode alongside the Express server, allowing for gradual endpoint migration.
4.  **Phase 4 (Maturity):** Fully adopt Nest.js idioms (Dependency Injection, Services) and migrate the simple event store to a robust database solution (e.g., PostgreSQL) using full CQRS/ES patterns.

By referencing these documents, future sessions can quickly gain the necessary context to make effective and consistent contributions.

## 4. Important Note on Test Data

The `test-cases/` directory is present in the developer's local environment for testing purposes but is excluded from the repository via `.gitignore`. It contains files with personal and sensitive information and **must not be committed** to the repository under any circumstances.

**Rule for AI Assistants:** Before any commit operation, always verify that the `test-cases/` directory is not staged. If it is, you must unstage it before proceeding with the commit. Do not ask for confirmation to do this, it is a mandatory step.