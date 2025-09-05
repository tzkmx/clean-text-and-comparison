# Project Roadmap: From CLI to Modular Service

This document outlines the architectural plan to evolve the `clean-text-cli` tool into a modular, multi-interface service.

## Phase 1: Code Modularization

The foundational first step is to refactor the current monolithic `index.js` script into a reusable core module and a thin presentation layer.

**Objective:** Separate the "what" (core logic) from the "how" (user interface).

### Proposed File Structure

```
/
|- index.js           # The "thin" CLI entry point
|- api.js             # The future Express.js API entry point
|- package.json
|- prompts/
|- src/
|  |- core.js        # The new, reusable core logic module
|  |- event-sourcing.js # The future module for handling event storage
```

### Refactoring Plan

1.  **Create `src/core.js` (The "Engine")**
    -   This module will contain the actual implementation of text processing.
    -   The `callLl` function will be moved here as an internal, un-exported function.
    -   It will **export** new, high-level functions (e.g., `executeClean`, `executeCompare`).
    -   These functions will contain the logic for reading prompts, preparing data, calling the LLM, and returning a result. They will be completely independent of any UI.

2.  **Refactor `index.js` (The "Presentation Layer")**
    -   This file's sole responsibility will be to parse CLI arguments.
    -   It will `require('./src/core.js')`.
    -   The `.action()` handlers will become simple one-line calls that delegate to the core module, passing the necessary options.

**Benefit:** The `src/core.js` module becomes a self-contained library. The CLI is just one consumer. The Express.js API will be another, preventing code duplication and improving maintainability.

---

## Phase 2: API Layer with Express.js

With a modular core, we can expose the functionality over a web API.

**Objective:** Allow programmatic access to the text processing services over HTTP.

### Dependencies
-   `express`: The web server framework.
-   `cors`: Middleware to enable Cross-Origin Resource Sharing for front-end applications.

### API Endpoint Design

-   **`POST /api/clean`**
    -   **Request Body:** `{ "text": "...", "model": "...", "authMode": "..." }`
    -   **Response Body:** `{ "cleanedText": "..." }`

-   **`POST /api/compare`**
    -   **Request Body:** `{ "textA": "...", "textB": "...", "type": "quick|detailed", ... }`
    -   **Response Body:** `{ "result": "..." }`

---

## Phase 3: Event Sourcing with Markdown

To create a complete audit trail, all core operations will be logged as individual events.

**Objective:** Create an immutable, human-readable log of every significant action the system performs.

### Trigger Point
-   Logging will be initiated from within the core module functions (`executeClean`, `executeCompare`) after a successful operation. This ensures all UIs (CLI, API) generate events automatically.

### Directory Structure
-   A new top-level `/events` directory will be created.
-   Events will be organized by type and date: `events/<type>/<YYYY-MM-DD>/<timestamp>-<id>.md`.

### Event File Format
-   Each event is a Markdown file with a YAML Frontmatter header for structured metadata and a Markdown body for the payload.
-   **Metadata Example:**
    ```yaml
    ---
    id: "evt_20250905_163000_a4f8"
    timestamp: "2025-09-05T16:30:00.123Z"
    eventType: "text.cleaned"
    sourceUI: "api"
    status: "success"
    processingMetadata:
      model: "gemini"
      authMode: "api"
      processingTimeMs: 1234
    ---
    ```
-   **Body Example:**
    ```markdown
    # Event: Text Cleaned

    ## Input

    The raw input text...

    ## Output

    The processed output text...
    ```
