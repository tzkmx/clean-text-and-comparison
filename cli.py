
import argparse
import os
import sys
from pathlib import Path

# --- Placeholder for LLM Interaction ---
# This will be replaced with actual API calls to Gemini, Claude, etc.
def call_llm(prompt: str, model: str, api_key: str | None) -> str:
    """
    Simulates calling a Large Language Model.
    In a real implementation, this function would handle API requests
    to the specified model provider.
    """
    print(f"--- Calling LLM '{model}' ---")
    # For now, just return a dummy response for testing purposes.
    # This helps verify the data flow without making real API calls.
    if "limpio, sin comentarios" in prompt:
        return "Este es el texto limpio y procesado por el modelo."
    elif "Coinciden sustancialmente" in prompt:
        return "Coinciden sustancialmente"
    else:
        return "Respuesta genérica del modelo."
    print("--- LLM Call Complete ---")

# --- Command Functions ---
def clean_text(args):
    """Handles the 'clean' command."""
    print(f"Starting 'clean' operation...")
    try:
        ocr_path = Path(args.input_file)
        output_path = Path(args.output_file)
        prompt_path = Path(__file__).parent / "prompts" / "clean_text.txt"

        if not ocr_path.is_file():
            print(f"Error: Input file not found at '{ocr_path}'")
            sys.exit(1)

        if not prompt_path.is_file():
            print(f"Error: Prompt file not found at '{prompt_path}'")
            sys.exit(1)

        print(f"Reading OCR text from: {ocr_path}")
        ocr_text = ocr_path.read_text(encoding="utf-8")
        
        print(f"Reading prompt from: {prompt_path}")
        prompt_template = prompt_path.read_text(encoding="utf-8")

        final_prompt = prompt_template.replace("{{texto_ocr}}", ocr_text)

        # In a real scenario, you'd get the API key from env vars
        api_key = os.getenv(f"{args.model.upper()}_API_KEY")
        
        cleaned_text = call_llm(final_prompt, args.model, api_key)

        output_path.write_text(cleaned_text, encoding="utf-8")
        print(f"Success! Cleaned text saved to: {output_path}")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)

def compare_texts(args):
    """Handles both 'compare-quick' and 'compare-detailed' commands."""
    print(f"Starting '{args.command}' operation...")
    try:
        file_a_path = Path(args.file_a)
        file_b_path = Path(args.file_b)
        
        prompt_name = "quick_comparison.txt" if args.command == "compare-quick" else "detailed_comparison.txt"
        prompt_path = Path(__file__).parent / "prompts" / prompt_name

        if not file_a_path.is_file() or not file_b_path.is_file():
            print(f"Error: Ensure both files exist. Searched for '{file_a_path}' and '{file_b_path}'")
            sys.exit(1)
        
        if not prompt_path.is_file():
            print(f"Error: Prompt file not found at '{prompt_path}'")
            sys.exit(1)

        print(f"Reading Text A from: {file_a_path}")
        text_a = file_a_path.read_text(encoding="utf-8")
        
        print(f"Reading Text B from: {file_b_path}")
        text_b = file_b_path.read_text(encoding="utf-8")

        print(f"Reading prompt from: {prompt_path}")
        prompt_template = prompt_path.read_text(encoding="utf-8")

        final_prompt = prompt_template.replace("{{texto_a}}", text_a).replace("{{texto_b}}", text_b)

        api_key = os.getenv(f"{args.model.upper()}_API_KEY")

        result = call_llm(final_prompt, args.model, api_key)

        print("\n--- Comparison Result ---")
        print(result)
        print("-------------------------\\n")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)

# --- Main CLI Setup ---
def main():
    parser = argparse.ArgumentParser(
        description="CLI tool to clean OCR text and compare documents using LLMs."
    )
    subparsers = parser.add_subparsers(dest="command", required=True, help="Available commands")

    # --- Clean Command ---
    parser_clean = subparsers.add_parser("clean", help="Clean an OCR text file.")
    parser_clean.add_argument("input_file", help="Path to the input OCR text file.")
    parser_clean.add_argument("output_file", help="Path to save the cleaned text file.")
    parser_clean.add_argument(
        "--model", 
        default="gemini", 
        help="LLM to use (e.g., gemini, claude, mistral). Default: gemini"
    )
    parser_clean.set_defaults(func=clean_text)

    # --- Quick Compare Command ---
    parser_quick = subparsers.add_parser("compare-quick", help="Perform a quick, high-level comparison of two files.")
    parser_quick.add_argument("file_a", help="Path to the first file (e.g., cleaned text).")
    parser_quick.add_argument("file_b", help="Path to the second file (e.g., reference text).")
    parser_quick.add_argument(
        "--model", 
        default="gemini", 
        help="LLM to use. Default: gemini"
    )
    parser_quick.set_defaults(func=compare_texts)

    # --- Detailed Compare Command ---
    parser_detailed = subparsers.add_parser("compare-detailed", help="Perform a detailed, line-by-line comparison.")
    parser_detailed.add_argument("file_a", help="Path to the first file.")
    parser_detailed.add_argument("file_b", help="Path to the second file.")
    parser_detailed.add_argument(
        "--model", 
        default="gemini", 
        help="LLM to use. Default: gemini"
    )
    parser_detailed.set_defaults(func=compare_texts)

    if len(sys.argv) == 1:
        parser.print_help(sys.stderr)
        sys.exit(1)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
