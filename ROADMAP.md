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
