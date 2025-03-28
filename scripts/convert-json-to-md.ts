import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 追加
import { cheatSheetSectionOrder } from '../src/data/cheatsheet-loader'; // 既存ローダーから順序を拝借
import { CodeExample } from '../src/data/types'; // 型定義を拝借

// ESモジュールで __dirname を再現
const __filename = fileURLToPath(import.meta.url); // 追加
const __dirname = path.dirname(__filename); // 追加

const jsonDir = path.join(__dirname, '../src/data/go-cheatsheet');
const markdownDir = path.join(__dirname, '../src/data/go-cheatsheet-md');

// スラグ生成関数 (簡易版)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // スペースをハイフンに
    .replace(/[^\w-]+/g, ''); // 英数字、アンダースコア、ハイフン以外を除去
}

// 3桁ゼロ埋め関数
function pad3(num: number): string {
  return String(num).padStart(3, '0');
}

// コメントのみか判定 (既存ローダーから拝借)
function isCommentBlock(code: string): boolean {
  const trimmedCode = code.trim();
  if (trimmedCode === '') return true;
  return trimmedCode.split('\n').every(line => {
    const trimmedLine = line.trim();
    return trimmedLine.startsWith('//') || trimmedLine === '';
  });
}

// コメント整形 (既存ローダーから拝借)
function formatCommentBlock(commentCode: string): string {
  return commentCode
    .split('\n')
    .map(line => line.trim().replace(/^\/\/\s*/, ''))
    .filter(line => line.trim() !== '')
    .join('\n');
}


console.log('Starting JSON to Markdown conversion...');

// 出力先ディレクトリを作成 (存在しない場合)
if (!fs.existsSync(markdownDir)) {
  fs.mkdirSync(markdownDir, { recursive: true });
  console.log(`Created directory: ${markdownDir}`);
}

let chapterIndex = 0;
for (const sectionId of cheatSheetSectionOrder) {
  const jsonFileName = `${sectionId}.json`;
  const jsonFilePath = path.join(jsonDir, jsonFileName);

  if (!fs.existsSync(jsonFilePath)) {
    console.warn(`Skipping: JSON file not found for section "${sectionId}" at ${jsonFilePath}`);
    continue;
  }

  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    const chapterSlug = sectionId; // sectionId をそのままスラグとして使用
    const chapterDirName = `${pad3(chapterIndex * 10)}_${chapterSlug}`; // 000_basics, 010_basic-types ...
    const chapterPath = path.join(markdownDir, chapterDirName);

    // 章ディレクトリを作成
    if (!fs.existsSync(chapterPath)) {
      fs.mkdirSync(chapterPath, { recursive: true });
      console.log(`Created chapter directory: ${chapterPath}`);
    }

    let exampleIndex = 0;
    let previousDescription: string | undefined = undefined; // コメントブロック処理用

    // JSON内の codeExamples を処理
    for (const example of jsonData.codeExamples as { title: string; code: string }[]) {
      if (isCommentBlock(example.code)) {
        // コメントブロックなら、次のコードブロックの説明として保持
        previousDescription = formatCommentBlock(example.code);
      } else {
        // 通常のコードブロック
        const exampleSlug = slugify(example.title);
        const exampleFileName = `${pad3(exampleIndex * 10)}_${exampleSlug}.md`; // 000_hello-world.md ...
        const exampleFilePath = path.join(chapterPath, exampleFileName);

        const frontMatter = `---
title: "${example.title.replace(/"/g, '\\"')}" # タイトル内のダブルクォートをエスケープ
tags: ["${chapterSlug}"]
---
`;
        // 前の反復で保持した説明があれば追加
        const descriptionContent = previousDescription ? `\n${previousDescription}\n` : '';
        const codeBlock = `\`\`\`go\n${example.code}\n\`\`\``;

        const markdownContent = frontMatter + descriptionContent + '\n' + codeBlock;

        fs.writeFileSync(exampleFilePath, markdownContent);
        // console.log(`  Created example file: ${exampleFileName}`);

        exampleIndex++;
        previousDescription = undefined; // 説明をリセット
      }
    }
    console.log(`Processed section "${sectionId}" (${jsonData.codeExamples.length} raw examples -> ${exampleIndex} markdown files)`);
    chapterIndex++;

  } catch (error) {
    console.error(`Error processing section "${sectionId}" from ${jsonFilePath}:`, error);
  }
}

console.log('Conversion finished.');