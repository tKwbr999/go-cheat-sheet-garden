import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';

const targetDir = path.resolve(__dirname, '../src/data/go-cheatsheet-md');
const yamlFrontmatterRegex = /^---\s*[\r\n]+(?:title:\s*(.+?)[\r\n]+)?(?:tags:\s*(\[.*?\])[\r\n]+)?---[\r\n]+/;
const customFrontmatterFormat = `## タイトル
title: $1
## タグ
tags: $2
`;

async function convertFrontmatter() {
  console.log(`Searching for markdown files in: ${targetDir}`);
  const files = await fg('**/*.md', { cwd: targetDir, absolute: true });
  console.log(`Found ${files.length} markdown files.`);

  let convertedCount = 0;
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const match = content.match(yamlFrontmatterRegex);

      if (match) {
        const title = match[1]?.trim() || '';
        const tags = match[2]?.trim() || '[]';

        // title が空の場合はスキップ（予期せぬ置換を防ぐ）
        if (!title) {
          console.warn(`Skipping ${path.relative(targetDir, file)}: Title is missing in YAML frontmatter.`);
          continue;
        }

        // カスタム形式を生成
        const customFormat = `## タイトル\ntitle: ${title}\n## タグ\ntags: ${tags}\n`;

        // YAML Front Matter をカスタム形式に置換
        const newContent = content.replace(yamlFrontmatterRegex, customFormat);

        if (newContent !== content) {
          await fs.writeFile(file, newContent, 'utf-8');
          console.log(`Converted: ${path.relative(targetDir, file)}`);
          convertedCount++;
        } else {
          // console.log(`Skipped (no change): ${path.relative(targetDir, file)}`);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  console.log(`\nConversion complete. ${convertedCount} files converted.`);
}

convertFrontmatter().catch(console.error);