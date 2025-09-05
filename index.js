#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

// --- Placeholder for LLM Interaction ---
async function callLl(prompt, model) {
  console.log(`--- Calling LLM '${model}' ---`);
  // In a real implementation, this would use a library like axios or node-fetch
  // to make an API call to the specified model's endpoint.
  // It would also retrieve the API key from environment variables.
  // const apiKey = process.env[`${model.toUpperCase()}_API_KEY`];
  // if (!apiKey) {
  //   console.error(`Error: API key for model '${model}' not found in environment variables.`);
  //   process.exit(1);
  // }

  // For now, simulate a response for testing purposes.
  if (prompt.includes('limpio, sin comentarios')) {
    return 'Este es el texto limpio y procesado por el modelo.';
  } else if (prompt.includes('Coinciden sustancialmente')) {
    return 'Coinciden sustancialmente';
  }
  return 'Respuesta genérica del modelo.';
}

program
  .name('clean-text-cli')
  .description('CLI tool to clean OCR text and compare documents using LLMs.')
  .version('1.0.0');

program
  .command('clean')
  .description('Clean an OCR text file.')
  .argument('<inputFile>', 'Path to the input OCR text file.')
  .argument('<outputFile>', 'Path to save the cleaned text file.')
  .option('--model <name>', 'LLM to use (e.g., gemini, claude)', 'gemini')
  .action(async (inputFile, outputFile, options) => {
    console.log(`Starting 'clean' operation...`);
    try {
      const promptPath = path.join(__dirname, 'prompts', 'clean_text.txt');
      
      if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file not found at '${inputFile}'`);
        process.exit(1);
      }
      if (!fs.existsSync(promptPath)) {
        console.error(`Error: Prompt file not found at '${promptPath}'`);
        process.exit(1);
      }

      console.log(`Reading OCR text from: ${inputFile}`);
      const ocrText = fs.readFileSync(inputFile, 'utf-8');

      console.log(`Reading prompt from: ${promptPath}`);
      const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

      const finalPrompt = promptTemplate.replace('{{texto_ocr}}', ocrText);

      const cleanedText = await callLl(finalPrompt, options.model);

      fs.writeFileSync(outputFile, cleanedText, 'utf-8');
      console.log(`Success! Cleaned text saved to: ${outputFile}`);
    } catch (e) {
      console.error(`An unexpected error occurred: ${e.message}`);
      process.exit(1);
    }
  });

const compareCommand = new Command('compare')
    .description('Compare two text files.');

compareCommand
    .command('quick')
    .description('Perform a quick, high-level comparison of two files.')
    .argument('<fileA>', 'Path to the first file.')
    .argument('<fileB>', 'Path to the second file.')
    .option('--model <name>', 'LLM to use', 'gemini')
    .action(async (fileA, fileB, options) => {
        console.log(`Starting 'compare-quick' operation...`);
        try {
            const promptPath = path.join(__dirname, 'prompts', 'quick_comparison.txt');
            if (!fs.existsSync(fileA) || !fs.existsSync(fileB)) {
                console.error(`Error: Ensure both files exist. Searched for '${fileA}' and '${fileB}'`);
                process.exit(1);
            }
            if (!fs.existsSync(promptPath)) {
                console.error(`Error: Prompt file not found at '${promptPath}'`);
                process.exit(1);
            }

            const textA = fs.readFileSync(fileA, 'utf-8');
            const textB = fs.readFileSync(fileB, 'utf-8');
            const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

            const finalPrompt = promptTemplate.replace('{{texto_a}}', textA).replace('{{texto_b}}', textB);

            const result = await callLl(finalPrompt, options.model);

            console.log('\n--- Comparison Result ---');
            console.log(result);
            console.log('-------------------------\n');
        } catch (e) {
            console.error(`An unexpected error occurred: ${e.message}`);
            process.exit(1);
        }
    });

compareCommand
    .command('detailed')
    .description('Perform a detailed, line-by-line comparison.')
    .argument('<fileA>', 'Path to the first file.')
    .argument('<fileB>', 'Path to the second file.')
    .option('--model <name>', 'LLM to use', 'gemini')
    .action(async (fileA, fileB, options) => {
        console.log(`Starting 'compare-detailed' operation...`);
        try {
            const promptPath = path.join(__dirname, 'prompts', 'detailed_comparison.txt');
            if (!fs.existsSync(fileA) || !fs.existsSync(fileB)) {
                console.error(`Error: Ensure both files exist. Searched for '${fileA}' and '${fileB}'`);
                process.exit(1);
            }
            if (!fs.existsSync(promptPath)) {
                console.error(`Error: Prompt file not found at '${promptPath}'`);
                process.exit(1);
            }

            const textA = fs.readFileSync(fileA, 'utf-8');
            const textB = fs.readFileSync(fileB, 'utf-8');
            const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

            const finalPrompt = promptTemplate.replace('{{texto_a}}', textA).replace('{{texto_b}}', textB);

            const result = await callLl(finalPrompt, options.model);

            console.log('\n--- Comparison Result ---');
            console.log(result);
            console.log('-------------------------\n');
        } catch (e) {
            console.error(`An unexpected error occurred: ${e.message}`);
            process.exit(1);
        }
    });

program.addCommand(compareCommand);

program.parse(process.argv);
