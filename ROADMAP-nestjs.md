# Roadmap & Analysis: Nest.js Event Sourced Architecture

This document provides an analysis of the proposal found in `copilot-proposal-for-event-sourced-api.md` and outlines a potential roadmap based on that architecture.

## 1. Executive Summary: Understanding the Proposal

The document proposes a highly structured, professional-grade application architecture using the **Nest.js** framework. It moves beyond a simple API to a full **Event Sourcing** and **CQRS (Command Query Responsibility Segregation)** pattern.

- **Core Idea:** Instead of data being directly created or updated, every change to the system is captured as an immutable "Event" in a database (the Event Store). The current state of any entity (an "Aggregate") is derived by replaying these events. Long-running processes are handled by **Sagas**, which listen for events and trigger new commands.

- **Key Technologies:**
  - **Framework:** Nest.js (a powerful, modular, and opinionated Node.js framework).
  - **Architecture:** CQRS & Event Sourcing.
  - **Structure:** A `npm workspaces` monorepo to separate the API application (`apps/api`) from shared domain logic (`packages/domain`).
  - **Event Store:** PostgreSQL for robust, transactional event storage.
  - **Artifact Storage:** Local markdown files, similar to our previous design.

In essence, this is a blueprint for a system designed for high scalability, auditability, and maintainability, typical of enterprise-grade applications.

## 2. Architectural Deep Dive

The proposal is well-decomposed into several key areas:

- **`packages/domain`:** This is the heart of the business logic, completely independent of Nest.js. It defines the core data structures (`dto.ts`), the different types of events that can occur (`events.ts`), and the `DocumentPipelineAggregate`, which represents the state of a single document workflow.
- **`apps/api/src/modules`:** This contains the framework-specific implementation.
  - **`eventstore`:** A service dedicated to writing events to and reading events from the PostgreSQL database. The `ProjectionsService` is critical, as it's responsible for reading an event stream and building the current state of an aggregate.
  - **`storage`:** A simple service for managing the `.md` file artifacts (OCR text, cleaned text, reports).
  - **`providers`:** An excellent implementation of the **Adapter Pattern**. It defines a common `LlmProvider` interface, allowing different LLMs (`GPT`, `Gemini`, `Claude`) to be used interchangeably. A `LlmRegistry` selects the appropriate provider at runtime.
  - **`ingest`, `compare`, `consolidate` (Sagas):** These modules represent the core business workflows. Each contains:
    - A `Controller` to receive the initial HTTP command.
    - A `Saga` to orchestrate the long-running process by listening for events (e.g., `OcrCleanRequested`) and dispatching new commands or producing new events.
  - **`audit`:** A read-only module that directly benefits from the event-sourcing pattern, allowing anyone to inspect the full event history or the current projected state ("snapshot") of any document pipeline.

## 3. Feasibility Analysis

**Verdict:** The proposal is **highly feasible** and represents a robust, production-ready architecture. It is, however, significantly more complex than the simple Express API we previously designed.

### Strengths:
- **Auditability:** The event store provides a perfect, immutable "paper trail" of every action taken in the system.
- **Scalability:** The decoupled nature of Sagas allows for asynchronous processing that can be scaled independently. The polling mechanism can be replaced with a message queue (like RabbitMQ or Kafka) to handle very high throughput.
- **Maintainability & Extensibility:** The modular design, clear separation of concerns, and use of adapters make the system easy to understand, maintain, and extend with new features or LLM providers.
- **Resilience:** Event-driven systems can be very resilient. If a saga fails while processing an event, it can be retried later without losing the original request.

### Challenges & Considerations:
- **Complexity & Learning Curve:** This is not a simple architecture. It requires a solid understanding of Nest.js, CQRS, and Event Sourcing principles. The learning curve for the team would be steeper than with a basic Express app.
- **Development Overhead:** The amount of boilerplate code (modules, DTOs, events, sagas) is significantly higher. This means initial feature development may be slower, though this investment pays off as the system grows.
- **Saga Implementation:** The proposal correctly identifies that using `setInterval` for polling is a simplification. For a production system, this must be replaced with a proper pub/sub mechanism.

## 4. Comparison to Previous Roadmap

This Nest.js proposal is an evolution of the ideas in our `ROADMAP.md`, but implemented with a much more formal and powerful architectural pattern.

- **Framework:** Nest.js vs. plain Express.js.
- **Architecture:** Full CQRS/ES vs. a simple modular 3-tier architecture.
- **Persistence:** A true PostgreSQL event store vs. using Markdown files as a simple event log.
- **Asynchronicity:** Formal Sagas vs. simple `async/await` calls within API handlers.

## 5. Proposed Implementation Path

If we choose to adopt this architecture, a phased approach is recommended:

1.  **Phase 1: Foundation & Core Domain.**
    -   Set up the monorepo structure with Nest.js.
    -   Configure Docker for the PostgreSQL event store.
    -   Implement the `packages/domain` logic (Events, DTOs, Aggregate).
    -   Build the `eventstore` and `storage` modules.
2.  **Phase 2: LLM Providers.**
    -   Implement the `providers` module with the `LlmRegistry` and at least one real LLM adapter.
3.  **Phase 3: The Ingestion Pipeline.**
    -   Build the `ingest` module, including the controller and the saga to handle the first step of the workflow (OCR cleaning).
4.  **Phase 4: Subsequent Pipelines & Audit.**
    -   Build the `compare` and `consolidate` modules.
    -   Implement the `audit` endpoints to expose the system's state.

This approach builds the system from the foundational layers up, ensuring each piece is solid before building on top of it.
