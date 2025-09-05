# Architecture and Design Choices

This document outlines the architecture and key design decisions for the `clean-text-cli` tool.

## 1. Core Concept and Purpose

The `clean-text-cli` is a Node.js command-line tool designed to leverage Large Language Models (LLMs) for advanced text-processing tasks. Its primary functions are:

1.  **Cleaning OCR Text:** Correcting common errors (e.g., formatting, typos, artifacts) in text extracted via Optical Character Recognition (OCR).
2.  **Comparing Documents:** Performing both high-level ("quick") and in-depth ("detailed") comparisons between two text documents.

The tool is built to be a flexible and powerful utility for developers and data processors who need to automate text normalization and analysis workflows.

## 2. Key Design Choices

The current implementation is based on several deliberate design choices that prioritize flexibility and ease of modification.

### a. Node.js and `commander` for the CLI

The tool is built on Node.js, allowing for fast, cross-platform execution. The `commander` library was chosen to structure the command-line interface. This provides a robust and conventional way to define commands (`clean`, `compare`), subcommands (`quick`, `detailed`), and options (`--model`, `--auth-mode`), making the tool intuitive for users familiar with standard CLI applications.

### b. Prompt-Driven Logic

Instead of hard-coding the logic for how to clean or compare text, the core instructions for the LLM are externalized into plain text files located in the `prompts/` directory.

-   **How it Works:** When a command is run, the tool reads the corresponding prompt file (e.g., `prompts/clean_text.txt`), injects the user-provided text into a placeholder (e.g., `{{texto_ocr}}`), and sends this final, combined text to the LLM.
-   **Benefit:** This approach decouples the complex instructional logic from the application code. It allows anyone to refine the cleaning or comparison behavior by simply editing a text file, without needing to modify or redeploy the Node.js application itself.

### c. Dual Authentication and Execution Strategy

A unique feature is the support for two distinct modes of LLM interaction, controlled by the `--auth-mode` flag:

1.  **`api` mode (default):** This mode uses the `@google/generative-ai` library to make a direct API call to the Gemini model. It requires the user to have a `GEMINI_API_KEY` set as an environment variable. This is a direct, efficient, and self-contained method.
2.  **`cli` mode:** This mode delegates the LLM call to an external `gemini-cli` command-line tool, which is expected to be available in the system's PATH.

-   **Benefit:** This dual strategy offers significant flexibility. The `api` mode is ideal for controlled environments like servers or CI/CD pipelines. The `cli` mode is useful for individual users who may already have the external CLI configured for authentication and prefer not to manage API keys directly within the application's environment.

## 3. Current Workflow and Structure

The entire application logic is currently contained within `index.js`.

The execution flow for a command like `clean` is as follows:

1.  **Parse Arguments:** `commander` parses the command-line arguments (`clean`, the input file, the output file, and any options).
2.  **Read Files:** The application reads the content of the specified input file and the corresponding prompt from the `prompts/` directory.
3.  **Construct Prompt:** It merges the input text with the prompt template.
4.  **Call LLM:** The `callLl` function is invoked, which, based on the `--auth-mode`, either makes a direct API call or spawns a `gemini-cli` process.
5.  **Write Output:** The response from the LLM is written to the specified output file (for the `clean` command) or printed directly to the console (for `compare` commands).

## 4. Future Expansion Plan

This section outlines the strategic evolution of the application from a monolithic CLI tool into a modular, event-driven system capable of supporting multiple interfaces.

### Phase 1: Core Logic Refactoring

The goal of this phase is to decouple the business logic from the CLI presentation layer.

1.  **Create Directory Structure:**
    *   Create a new top-level directory named `src/`.
    *   Inside `src/`, create a `core/` directory for the modularized business logic.

2.  **Isolate LLM Service:**
    *   Create a new file: `src/core/llm-service.js`.
    *   Move the `callLl` function from `index.js` into this new file and export it. This module's sole responsibility will be to communicate with the LLM.

3.  **Create Text Processor Service:**
    *   Create a new file: `src/core/text-processor.js`.
    *   This module will contain the main business logic. Create and export new functions:
        *   `cleanText(inputText, model, authMode)`
        *   `compareTexts(textA, textB, model, authMode, comparisonType)` where `comparisonType` is 'quick' or 'detailed'.
    *   These functions will read the appropriate prompt files, construct the final prompt, and use the `llm-service.js` module to get the results. They will return the processed text.

4.  **Refactor the CLI (`index.js`):**
    *   Modify `index.js` to be a thin client.
    *   Remove the `callLl` function and import the new functions from `src/core/text-processor.js`.
    *   Update the `action` handlers for each command to call the corresponding function from the text processor service and handle the input/output (reading files and printing results).

### Phase 2: Event Sourcing Implementation

This phase introduces an event-driven architecture to log all significant activities in the system.

1.  **Create Event Logger:**
    *   Create a new file: `src/core/event-logger.js`.
    *   This module will handle the creation of event records.

2.  **Define `logEvent` Function:**
    *   Inside `event-logger.js`, create and export an async function `logEvent({ eventType, source, metadata, content })`.
    *   `eventType`: A string like `TEXT_CLEAN_REQUEST`, `COMPARISON_REQUEST`, `LLM_SUCCESS_RESPONSE`.
    *   `source`: The origin of the event (e.g., `CLI`, `API`).
    *   `metadata`: A JavaScript object for key-value data (`modelUsed`, `processingTime`, `tokenCount`, etc.).
    *   `content`: The main data payload (e.g., the input OCR text or the final cleaned text).

3.  **Implement Markdown File Storage:**
    *   The `logEvent` function will generate a markdown file for each event.
    *   **File Path:** `events/{YYYY}/{MM}/{DD}/{timestamp}-{eventType}.md`.
    *   **File Content:** The file will use YAML front matter for the structured data and the body for the unstructured text content.
        ```markdown
        ---
        timestamp: 2025-09-05T10:30:00.123Z
        eventType: TEXT_CLEAN_REQUEST
        source: CLI
        modelUsed: gemini
        ---

        The raw OCR text content would be here...
        ```

4.  **Integrate Logging:**
    *   In `src/core/text-processor.js`, call the `logEvent` function at key stages of processing:
        *   When a request is first received.
        *   After the LLM returns a successful response.
        *   If an error occurs during processing.

### Phase 3: API Development

This phase exposes the core logic via a web API.

1.  **Install Dependencies:**
    *   Add `express` and `cors` to the project's dependencies.

2.  **Create API Server:**
    *   Create a new file: `api.js` in the root directory.
    *   Set up a basic Express server that listens on a configurable port.

3.  **Define API Endpoints:**
    *   `POST /v1/clean`: Expects a JSON body `{ "text": "..." }`. It will call `cleanText` from the text processor and pass `API` as the event source.
    *   `POST /v1/compare`: Expects `{ "textA": "...", "textB": "...", "type": "quick" }`. It will call `compareTexts` and pass `API` as the event source.
    *   The endpoints will return the results as a JSON response.

### Phase 4: Demo UI (Vue.js)

This phase creates a simple web interface for interactive demos.

1.  **Scaffold Vue Project:**
    *   In a new directory, `ui-demo/`, initialize a new Vue.js project using a tool like the Vue CLI (`vue create .`).

2.  **Install Dependencies:**
    *   Add `axios` to the Vue project for making HTTP requests.

3.  **Build UI Components:**
    *   Create a component for the "Clean Text" feature with a textarea input and a results display.
    *   Create a component for the "Compare" feature with two textarea inputs and a results display.

4.  **Connect to API:**
    *   Implement methods in the Vue components that use `axios` to call the Express API endpoints created in Phase 3.
    *   The UI will display the results returned by the API.

## 5. Comparative Architectural Analysis and Strategic Path

This section provides a comparative analysis of different architectural approaches and defines the recommended strategic path forward, incorporating insights from the `ROADMAP*.md` files and the `copilot-proposal-for-event-sourced-api.md` document.

### 5.1. Architectural Options

We have three primary architectural options, each with distinct costs and benefits:

-   **Approach A: Modular Express API (Current Plan)**
    -   **Description:** The phased plan detailed in Section 4 of this document. It focuses on refactoring the core logic into a reusable module, exposing it via an Express.js API, and using Markdown files for simple event logging.
    -   **Costs:** Moderate complexity, requires refactoring, and the event store is not suited for complex queries.
    -   **Opportunities:** A pragmatic, incremental improvement that decouples logic, enables multiple UIs, and introduces a human-readable audit trail. It delivers value quickly.

-   **Approach B: Full CQRS/ES with Nest.js (Advanced Proposal)**
    -   **Description:** A highly structured, enterprise-grade architecture using Nest.js, CQRS, and Event Sourcing with a PostgreSQL database.
    -   **Costs:** Very high complexity and a steep learning curve. Requires a dedicated database service and involves significant boilerplate, slowing initial development.
    -   **Opportunities:** Extremely scalable, maintainable, and provides a perfect, immutable audit log. The formal separation of Commands and Queries, along with first-class Sagas, is ideal for complex, long-running, and mission-critical business processes.

-   **Approach C: Monolithic CLI (Original State)**
    -   **Description:** The initial state of the project as a single-file Node.js script.
    -   **Costs:** While simple initially, it becomes very costly to maintain, extend, or scale.
    -   **Opportunities:** Serves as a good starting point or a tool for simple, local-only tasks.

### 5.2. Recommended Strategic Path: Phased Migration

The most prudent strategy is not to choose a single approach but to create an evolutionary path from Approach A to Approach B. This allows for rapid initial delivery of value while building towards a more robust final architecture as requirements evolve.

The `ROADMAP-migration.md` document outlines this path perfectly:

1.  **Foundation (Approach A):** Fully implement the modular Express.js service with Markdown-based event sourcing as planned. This creates a solid, functional baseline.
2.  **Prepare for Nest.js:** Convert the codebase from JavaScript to **TypeScript**. This is a critical prerequisite for introducing Nest.js and provides immediate benefits in code quality and maintainability.
3.  **Introduce Nest.js in Hybrid Mode:** Run a Nest.js instance *within* the existing Express server. This allows new or refactored endpoints (e.g., `/v2/clean`) to be handled by Nest.js while leaving the existing Express endpoints operational, ensuring zero downtime.
4.  **Adopt Nest.js Idioms:** Gradually refactor the core logic from simple exported functions into injectable Nest.js **Services**. This fully leverages the power of Dependency Injection and decouples components properly.
5.  **Implement CQRS and True Event Sourcing:** For new features or as existing ones are refactored, introduce the full CQRS/ES pattern. This includes using the `CommandBus` and `EventBus`, and migrating from Markdown files to a **PostgreSQL event store**.
6.  **Complete the Migration:** Once all functionality is handled by Nest.js, the original Express server can be retired, leaving a pure, powerful, and scalable Nest.js application.

By following this path, we strategically manage complexity, mitigate risk, and ensure the architecture can grow with the project's success.