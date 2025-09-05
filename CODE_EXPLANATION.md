# Technical Explanation: `clean-text-cli` (`index.js`)

This document outlines the architecture and implementation of the `index.js` script.

## 1. Imports & Setup (The Foundation)

The script begins by importing all necessary modules. These act as the foundational toolset for the entire application.

```javascript
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
```

-   **`commander`**: A key external library used to create a professional and easy-to-use command-line interface. It handles parsing commands, arguments, and options.
-   **`fs` (File System)**: A built-in Node.js module used for all file interactions, such as reading the content of the input files and prompts (`fs.readFileSync`) and writing the final output (`fs.writeFileSync`).
-   **`path`**: A built-in Node.js module used for handling and transforming file paths in a cross-platform way (e.g., `path.join`). This is crucial for ensuring the script runs on Windows, macOS, and Linux.
-   **`child_process` (`spawn`)**: A built-in Node.js module that allows the script to run other programs. We use its `spawn` function specifically for the `--auth-mode cli` to execute `gemini-cli` as a separate process.
-   **`@google/generative-ai`**: The official Google client library for the Gemini API. This is used for the `--auth-mode api` to make direct, authenticated requests to the Gemini backend.

## 2. `commander` Program Definition (The User Interface)

This section defines the entire shape of the CLI—what the user sees and how they interact with it.

```javascript
program
  .name('clean-text-cli')
  .description('...')
  .version('1.0.0')
  .option('--auth-mode <mode>', '...', 'api');
```

-   A new `Command` object is created, which represents the entire CLI program.
-   `.name()`, `.description()`, and `.version()` set up the top-level help text.
-   `.option('--auth-mode ...')` is a **global option**. This is a key design choice. By defining it at the top level, it's available to all sub-commands, and we can access its value from anywhere using `program.opts()`. We've set `'api'` as the default value.

The script then defines the actual commands (`clean`, `compare-quick`, etc.) by chaining `.command()` and `.action()` methods.

## 3. Command Action Handlers (The "Wiring")

Each command has an associated `.action()` function. This function is the callback that executes when a user runs that specific command. Let's look at the `clean` command's action as a representative example.

```javascript
.action(async (inputFile, outputFile, options) => {
    try {
      // 1. Get global options
      const globalOptions = program.opts();
      
      // 2. Prepare paths and read files
      const promptPath = path.join(__dirname, 'prompts', 'clean_text.txt');
      const ocrText = fs.readFileSync(inputFile, 'utf-8');
      const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

      // 3. Process data
      const finalPrompt = promptTemplate.replace('{{texto_ocr}}', ocrText);

      // 4. Execute core logic
      const cleanedText = await callLl(finalPrompt, options.model, globalOptions.authMode);

      // 5. Output result
      fs.writeFileSync(outputFile, cleanedText, 'utf-8');
      console.log(`Success! ...`);
    } catch (e) {
      // ... error handling
    }
});
```

This demonstrates a clear, repeatable pattern:
1.  **Gather Inputs:** It gets the command-specific arguments (`inputFile`) and the global options (`authMode`).
2.  **Orchestrate:** It reads the necessary files, uses the data to prepare a final prompt, and then calls the central `callLl` function.
3.  **Produce Output:** It takes the result from `callLl` and writes it to the destination file.
4.  **Error Handling:** The entire logic is wrapped in a `try...catch` block to gracefully handle any errors that might occur during the process.

## 4. The `callLl` Function (The "Engine Room")

This is the most critical function in the script. It abstracts the two different methods of communicating with the LLM.

```javascript
async function callLl(prompt, model, authMode) {
  // ...
}
```

-   **`if (authMode === 'cli')`**:
    -   This block handles shelling out to an external command.
    -   It uses `spawn('gemini-cli', ...)` which is safer than `exec` for passing potentially complex string data.
    -   It returns a `Promise`, which is the modern standard for handling asynchronous operations in Node.js.
    -   It listens to `stdout`, `stderr`, and `close`/`error` events on the child process to robustly capture the output or any errors that occur.

-   **`else if (authMode === 'api')`**:
    -   This block handles direct API communication.
    -   It first checks for the `GEMINI_API_KEY` in `process.env`, making the API key a configuration secret that isn't hardcoded.
    -   It instantiates the `GoogleGenerativeAI` client, gets the model, and calls `generateContent`.
    -   The entire block is wrapped in its own `try...catch` to handle API-specific errors (e.g., network issues, authentication failure).

This dual-mode function is a powerful design choice that makes the application flexible, allowing users to choose their preferred authentication method without changing the core logic of the action handlers.
