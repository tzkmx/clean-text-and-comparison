#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const program = new Command();

// --- LLM Interaction ---
async function callLl(prompt, model, authMode) {
  console.log(`--- Calling LLM '${model}' using auth mode: ${authMode} ---`);

  if (authMode === 'cli') {
    // Use external CLI tool
    return new Promise((resolve, reject) => {
      const cliProcess = spawn('gemini-cli', ['--prompt', prompt], { shell: true });
      let stdout = '';
      let stderr = '';

      cliProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      cliProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      cliProcess.on('close', (code) => {
        if (code !== 0) {
          const errorMessage = `gemini-cli process exited with code ${code}: ${stderr}`;
          console.error(errorMessage);
          reject(new Error(errorMessage));
        } else {
          console.log('--- gemini-cli call complete ---');
          resolve(stdout.trim());
        }
      });

      cliProcess.on('error', (err) => {
        const errorMessage = `Failed to start gemini-cli process. Is it installed and in your PATH? Error: ${err.message}`;
        console.error(errorMessage);
        reject(new Error(errorMessage));
      });
    });
  } else if (authMode === 'api') {
    // Use direct API call
    if (model !== 'gemini') {
      throw new Error(`API mode currently only supports 'gemini', not '${model}'.`);
    }
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable not set for API mode.');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('--- LLM Call Complete ---');
      return text;
    } catch (error) {
      console.error(`Error calling Gemini API: ${error.message}`);
      process.exit(1);
    }
  } else {
    throw new Error(`Invalid authentication mode: '${authMode}'. Use 'api' or 'cli'.`);
  }
}

program
  .name('clean-text-cli')
  .description('CLI tool to clean OCR text and compare documents using LLMs.')
  .version('1.0.0')
  .option('--auth-mode <mode>', 'Authentication mode: "api" for direct key, "cli" for external CLI', 'api');

program
  .command('clean')
  .description('Clean an OCR text file.')
  .argument('<inputFile>', 'Path to the input OCR text file.')
  .argument('<outputFile>', 'Path to save the cleaned text file.')
  .option('--model <name>', 'LLM to use (e.g., gemini, claude)', 'gemini')
  .action(async (inputFile, outputFile, options) => {
    console.log(`Starting 'clean' operation...`);
    try {
      const globalOptions = program.opts();
      const promptPath = path.join(__dirname, 'prompts', 'clean_text.txt');
      
      if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file not found at '${inputFile}'`);
        process.exit(1);
      }
      if (!fs.existsSync(promptPath)) {
        console.error(`Error: Prompt file not found at '${promptPath}'`);
        process.exit(1);
      }

      const ocrText = fs.readFileSync(inputFile, 'utf-8');
      const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
      const finalPrompt = promptTemplate.replace('{{texto_ocr}}', ocrText);

      const cleanedText = await callLl(finalPrompt, options.model, globalOptions.authMode);

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
            const globalOptions = program.opts();
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

            const result = await callLl(finalPrompt, options.model, globalOptions.authMode);

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
            const globalOptions = program.opts();
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

            const result = await callLl(finalPrompt, options.model, globalOptions.authMode);

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