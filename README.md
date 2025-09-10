# Clean Text CLI

A command-line tool to clean OCR text and compare documents using Generative AI.

## Installation

To use this tool as a command-line executable, you can install it globally using npm.

1.  Navigate to the root directory of this project.
2.  Run the following command:

    ```bash
    npm install -g .
    ```

This will install the `clean-text-cli` command on your system.

## Usage

Once installed, you can use the `clean-text-cli` command directly from your terminal.

### Clean Text

```bash
clean-text-cli clean <inputFile> <outputFile> --auth-mode <cli|api>
```

-   `<inputFile>`: Path to the input OCR text file.
-   `<outputFile>`: Path to save the cleaned text file.
-   `--auth-mode`: (Optional) `cli` for `gemini-cli`, `api` for Google API key. Defaults to `cli`.

### Compare Files

#### Quick Comparison

```bash
clean-text-cli compare quick <fileA> <fileB>
```

#### Detailed Comparison

```bash
clean-text-cli compare detailed <fileA> <fileB>
```

---

## Alternative Usage (Windows - PowerShell)

If you prefer not to install the tool globally, you can use a PowerShell script to run it directly.

1.  Create a file named `clean-text.ps1`.
2.  Add the following content to the file:

    ```powershell
    # clean-text.ps1
    # Usage: ./clean-text.ps1 clean <inputFile> <outputFile>

    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    $indexPath = Join-Path $scriptPath "index.js"

    node $indexPath $args
    ```

3.  You can then run the tool from your PowerShell terminal:

    ```powershell
    ./clean-text.ps1 clean C:\path\to\input.txt C:\path\to\output.txt
    ```

*Note: You may need to adjust your PowerShell execution policy to run local scripts. You can do this by running `Set-ExecutionPolicy RemoteSigned` in an administrator PowerShell terminal.*
