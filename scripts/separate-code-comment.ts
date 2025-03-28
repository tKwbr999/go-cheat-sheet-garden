import fs from 'fs/promises';
import path from 'path';

interface CodeExample {
  title: string;
  code: string;
}

interface CheatSheetSection {
  title: string;
  codeExamples: CodeExample[];
}

const targetDir = path.join(__dirname, '../src/data/go-cheatsheet');
const commentRegex = /^(.*?)(\s*\/\/.*)$/; // 行末コメントをキャプチャする正規表現
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second

// Helper function for sleep
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

async function processFile(filePath: string): Promise<boolean> {
  const fileName = path.basename(filePath);
  console.log(`Processing ${fileName}...`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data: CheatSheetSection = JSON.parse(fileContent);

      let modified = false;
      for (const example of data.codeExamples) {
        const originalCode = example.code;
        const lines = originalCode.split('\n');
        const newLines: string[] = [];
        let fileModifiedInLoop = false; // Track modification within this specific file processing attempt

        for (const line of lines) {
          // 行頭が // で始まるコメント行はそのまま
          if (line.trim().startsWith('//')) {
            newLines.push(line);
            continue;
          }

          const match = line.match(commentRegex);
          // 行末に // コメントがあり、かつ行頭が // でない場合
          if (match && match[1].trim() !== '') {
            const codePart = match[1].trimEnd(); // コメント前のコード部分（末尾空白削除）
            const commentPart = match[2].trim(); // コメント部分（先頭空白削除）

            newLines.push(commentPart); // コメントを前の行に
            newLines.push(codePart);    // コードを次の行に
            fileModifiedInLoop = true; // Mark as modified in this loop
          } else {
            // コメントがない行、またはコメントのみの行（行頭//は上で処理済）
            newLines.push(line);
          }
        }

        if (fileModifiedInLoop) {
          example.code = newLines.join('\n');
          modified = true; // Mark overall modification for the file
        }
      }

      if (modified) {
        // インデント 2 スペースで JSON を整形して書き込む
        const updatedJson = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, updatedJson + '\n', 'utf-8'); // 末尾に改行を追加
        console.log(`  Updated ${fileName}`);
      } else {
        console.log(`  No changes needed for ${fileName}`);
      }
      return true; // Success

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  Attempt ${attempt} failed for ${fileName}: ${errorMessage}`);
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`  Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
      } else {
        console.error(`  Failed to process ${fileName} after ${MAX_RETRIES} attempts.`);
        return false; // Failure after retries
      }
    }
  }
  return false; // Should not be reached, but satisfies TypeScript
}

async function main(): Promise<void> {
  console.log(`Starting script to separate code and comments in ${targetDir}`);
  const failedFiles: string[] = [];

  try {
    const files = await fs.readdir(targetDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    for (const file of jsonFiles) {
      const filePath = path.join(targetDir, file);
      const success = await processFile(filePath);
      if (!success) {
        failedFiles.push(path.basename(file));
      }
    }

    console.log('\nScript finished.');
    if (failedFiles.length > 0) {
      console.warn('\nWarning: The following files could not be processed successfully:');
      failedFiles.forEach(file => console.warn(`- ${file}`));
      process.exitCode = 1; // Indicate partial failure
    } else {
      console.log('All files processed successfully.');
    }

  } catch (error) {
    console.error('\nCritical error during script execution:', error);
    process.exit(1); // Indicate critical failure
  }
}

main();