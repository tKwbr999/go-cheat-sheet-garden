import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

const targetDir = 'src/data/go-cheatsheet-md';
const tempGoFile = 'temp_gofmt.go';
const goCodeBlockRegex = /```go\n([\s\S]*?)\n```/g;

async function formatGoCodeBlocksInFile(filePath: string): Promise<void> {
  console.log(`Processing ${filePath}...`);
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let hasChanges = false;
    const codeBlocks = [...content.matchAll(goCodeBlockRegex)];

    if (codeBlocks.length === 0) {
      console.log('  No Go code blocks found.');
      return;
    }

    console.log(`  Found ${codeBlocks.length} Go code blocks.`);

    // Use replace with an async replacer function
    content = await asyncReplace(content, goCodeBlockRegex, async (match, code) => {
      const originalCode = code.trim(); // Trim whitespace for comparison later
      if (!originalCode) {
        return match; // Skip empty code blocks
      }

      try {
        // Execute gofmt -s using stdin/stdout
        const formattedCode = execSync(`gofmt -s`, { input: originalCode, encoding: 'utf-8' }).trim();

        if (originalCode !== formattedCode) {
          hasChanges = true;
          console.log('    Formatted a code block.');
          return '```go\n' + formattedCode + '\n```';
        } else {
          // console.log('    Code block already formatted.');
          return match; // Return original match if no changes
        }
      } catch (error: unknown) { // Catch the error to log and skip, use unknown type
        console.warn(`  Skipping formatting for a code block in ${filePath} due to gofmt error:`);
        // Type guard to check if error is an object with stderr
        if (typeof error === 'object' && error !== null && 'stderr' in error) {
          // Cast to a more specific type after the check
          const errWithStderr = error as { stderr: unknown };
          // Check if stderr is a Buffer before calling toString, otherwise use String()
          if (errWithStderr.stderr instanceof Buffer) {
             console.warn('    gofmt stderr:', errWithStderr.stderr.toString());
          } else {
             console.warn('    gofmt stderr:', String(errWithStderr.stderr));
          }
        } else {
          console.warn('    Error:', error);
        }
        return match; // Return the original match to skip formatting
      }
    });

    if (hasChanges) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`  Successfully updated ${filePath}`);
    } else {
      console.log(`  No changes needed for ${filePath}`);
    }

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    // Continue to the next file instead of stopping the script
    // throw error; // Commented out to allow script continuation
  }
}

// Helper function for async replace
async function asyncReplace(
  str: string,
  regex: RegExp,
  // The replacer function arguments are: full match, capture groups, offset, original string
  asyncFn: (match: string, code: string, offset: number, originalString: string) => Promise<string>
): Promise<string> {
  const promises: Promise<string>[] = [];
  // The callback for replace gets arguments: match, p1, p2, ..., offset, string
  str.replace(regex, (match, code, offset, originalString) => {
    // Pass the captured group (code) and other relevant args if needed by asyncFn
    promises.push(asyncFn(match, code, offset, originalString));
    return match; // Placeholder, will be replaced later
  });
  const replacements = await Promise.all(promises);
  let i = 0;
  return str.replace(regex, () => replacements[i++]);
}


async function main() {
  try {
    const mdFiles = await glob(`${targetDir}/**/*.md`);
    console.log(`Found ${mdFiles.length} Markdown files.`);

    for (const file of mdFiles) {
      await formatGoCodeBlocksInFile(path.resolve(file));
    }

    console.log('\nSuccessfully formatted Go code blocks in all Markdown files.');
  } catch (error) {
    console.error('\nScript failed:', error);
    process.exit(1); // Exit with error code
  }
}

main();