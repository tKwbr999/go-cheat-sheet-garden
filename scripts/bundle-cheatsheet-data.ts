import fs from 'fs/promises';
import path from 'path';
// 型定義のパスを修正 (スクリプトからの相対パス)
import type { CheatSheetSection, CodeExample } from '../src/data/types';

// データセクションの順序とタイトルを定義
const cheatSheetSectionsMetadata: { id: string; title: string }[] = [
  { id: "basics", title: "Basics" },
  { id: "basic-types", title: "Basic Types" },
  { id: "flow-control", title: "Flow Control" },
  { id: "functions", title: "Functions" },
  { id: "data-structures", title: "Data Structures" },
  { id: "methods", title: "Methods" },
  { id: "interfaces", title: "Interfaces" },
  { id: "packages", title: "Packages" },
  { id: "error-handling", title: "Error Handling" },
  { id: "concurrency", title: "Concurrency" },
  { id: "context", title: "Context" },
  { id: "io-operations", title: "I/O Operations" },
  { id: "generics", title: "Generics" },
  { id: "references", title: "References" },
];

const sectionsSourceDir = path.join(__dirname, '../src/data/go-cheatsheet/sections');
// 出力先を public ディレクトリに変更
const outputSectionsDir = path.join(__dirname, '../public/data/sections');
const outputManifestPath = path.join(__dirname, '../public/data/sections-manifest.json');

// コードがコメントのみか判定するヘルパー関数
function isCommentBlock(code: string): boolean {
  const trimmedCode = code.trim();
  if (trimmedCode === "") return true;
  return trimmedCode.split("\n").every((line) => {
    const trimmedLine = line.trim();
    return trimmedLine.startsWith("//") || trimmedLine === "";
  });
}

// コメント内容を整形するヘルパー関数
function formatCommentBlock(commentCode: string): string {
  return commentCode
    .split("\n")
    .map((line) => line.trim().replace(/^\/\/\s*/, ""))
    .filter((line) => line.trim() !== "")
    .join("\n");
}

// 元データから整形済みデータを生成する関数 (変更なし)
function processRawSectionData(rawData: { title: string; codeExamples: { title: string; code: string }[] }): CheatSheetSection {
    const processedExamples: CodeExample[] = [];
    let previousExample: CodeExample | null = null;

    for (const currentExample of rawData.codeExamples) {
      if (isCommentBlock(currentExample.code)) {
        if (previousExample) {
          previousExample.description = formatCommentBlock(currentExample.code);
        }
      } else {
        const newExample: CodeExample = {
             title: currentExample.title,
             code: currentExample.code,
             description: undefined
        };
        processedExamples.push(newExample);
        previousExample = newExample;
      }
    }
    return {
      title: rawData.title,
      codeExamples: processedExamples,
    };
}

async function prepareData() {
  console.log('Preparing cheatsheet data for static serving...');
  const manifestData: { id: string; title: string }[] = [];

  try {
    // 出力先ディレクトリを作成 (存在しない場合)
    await fs.mkdir(outputSectionsDir, { recursive: true });
    console.log(`Ensured output directory exists: ${outputSectionsDir}`);
  } catch (error) {
    console.error(`Error creating output directory ${outputSectionsDir}:`, error);
    return; // ディレクトリ作成に失敗したら処理中断
  }

  for (const meta of cheatSheetSectionsMetadata) {
    const sourceFilePath = path.join(sectionsSourceDir, `${meta.id}.json`);
    const outputFilePath = path.join(outputSectionsDir, `${meta.id}.json`);
    try {
      const fileContent = await fs.readFile(sourceFilePath, 'utf-8');
      if (!fileContent.trim()) {
          console.warn(`Warning: Source file is empty, skipping: ${sourceFilePath}`);
          continue;
      }
      const rawData = JSON.parse(fileContent);
      if (!rawData || !Array.isArray(rawData.codeExamples)) {
          console.warn(`Warning: Invalid data structure in ${sourceFilePath}, skipping.`);
          continue;
      }

      // データを整形 (コメント処理など)
      const processedData = processRawSectionData(rawData);

      // 整形済みデータを public/data/sections/{id}.json に書き出す
      await fs.writeFile(outputFilePath, JSON.stringify(processedData, null, 2), 'utf-8');
      console.log(`Processed and copied: ${meta.id}.json to ${outputFilePath}`);

      // マニフェストデータに追加
      manifestData.push({ id: meta.id, title: processedData.title }); // 整形後のタイトルを使用

    } catch (error) {
      console.error(`Error processing ${sourceFilePath}:`, error);
    }
  }

  // マニフェストファイルを public/data/sections-manifest.json に書き出す
  try {
    await fs.writeFile(outputManifestPath, JSON.stringify(manifestData, null, 2), 'utf-8');
    console.log(`Successfully created manifest file: ${outputManifestPath}`);
  } catch (error) {
    console.error(`Error writing manifest file:`, error);
  }
}

prepareData();