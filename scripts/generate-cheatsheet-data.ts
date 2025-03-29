import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { CheatSheetSection, CodeExample } from '../src/data/types'; // types.ts からインポート

// --- 型定義 (markdown-cheatsheet-loader.ts からコピー) ---
interface InternalCodeExample extends CodeExample {
  tags: string[];
  filePath: string; // ソート用に保持
}

interface InternalCheatSheetSection extends Omit<CheatSheetSection, 'codeExamples'> {
  id: string;
  orderPrefix: string;
  codeExamples: InternalCodeExample[];
}

interface ParsedFrontMatter {
  title?: string;
  tags?: string[];
}

// --- 解析関数 (markdown-cheatsheet-loader.ts からコピー) ---
function extractInfoFromPath(
  filePath: string
): { chapterId: string; chapterPrefix: string; examplePrefix: string; exampleSlug: string } | null {
  // プロジェクトルートからの相対パスに変換してマッチさせる
  const relativePath = path.relative(process.cwd(), filePath);
  const match = relativePath.match(/src\/data\/go-cheatsheet-md\/(\d{3})_([^/]+)\/(\d{3})_([^/]+)\.md$/);
  if (!match) {
    console.warn(`[generate-data] Could not parse path: ${relativePath}`);
    return null;
  }
  return {
    chapterPrefix: match[1],
    chapterId: match[2],
    examplePrefix: match[3],
    exampleSlug: match[4],
  };
}

function parseFrontMatter(content: string): { data: ParsedFrontMatter; content: string } {
  const data: ParsedFrontMatter = {};
  const markdownContent = content;

  const titleMatch = content.match(/## タイトル\s*title:\s*(.+?)(?=\n|$)/);
  if (titleMatch) {
    data.title = titleMatch[1].trim();
  }

  const tagsMatch = content.match(/## タグ\s*tags:\s*(\[.*\])/);
  if (tagsMatch && tagsMatch[1]) {
    const tagsString = tagsMatch[1]
      .slice(1, -1)
      .trim();

    if (tagsString) {
      data.tags = tagsString
        .split(',')
        .map(tag => {
          const trimmedTag = tag.trim();
          if ((trimmedTag.startsWith('"') && trimmedTag.endsWith('"')) || (trimmedTag.startsWith("'") && trimmedTag.endsWith("'"))) {
            return trimmedTag.slice(1, -1);
          }
          return trimmedTag;
        })
        .filter(tag => tag);
    } else {
      data.tags = [];
    }
  }

  return { data, content: markdownContent };
}

function extractDescriptionAndCode(markdownContent: string): {
  description?: string;
  code: string;
} {
  let code = '';
  let description = '';

  const codeMatch = markdownContent.match(/## コード\s*```go\s*([\s\S]*?)```/);
  if (codeMatch) {
    code = codeMatch[1].trim();
  }

  const descMatch = markdownContent.match(/## 解説\s*```text\s*([\s\S]*?)```/);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  return { description, code };
}

// --- メイン処理 ---
async function generateCheatSheetData() {
  const markdownDir = path.join(process.cwd(), 'src/data/go-cheatsheet-md');
  const outputDir = path.join(process.cwd(), 'src/data/generated');
  const outputFile = path.join(outputDir, 'cheatsheet-data.json');

  console.log('[generate-data] Finding Markdown files...');
  // glob を非同期で実行
  const files = await glob(`${markdownDir}/**/*.md`);
  console.log(`[generate-data] Found ${files.length} files.`);

  const tempSections: Record<string, InternalCheatSheetSection> = {};

  console.log('[generate-data] Parsing files...');
  for (const filePath of files) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const pathInfo = extractInfoFromPath(filePath);

    if (!pathInfo) continue;

    const { chapterId, chapterPrefix } = pathInfo;
    const { data: frontMatter, content: markdownContent } = parseFrontMatter(fileContent);

    if (!frontMatter.title) {
      console.warn(`[generate-data] Skipping ${filePath}: Missing or invalid 'title'.`);
      continue;
    }

    const { description, code } = extractDescriptionAndCode(markdownContent);

    if (!code) {
      console.warn(`[generate-data] Skipping ${filePath}: No Go code block found.`);
      continue;
    }

    const defaultTags = [chapterId];
    const tags = frontMatter.tags
      ? [...new Set([...defaultTags, ...frontMatter.tags])]
      : defaultTags;

    const codeExample: InternalCodeExample = {
      title: frontMatter.title,
      description,
      code,
      tags,
      filePath, // ソートのために保持
    };

    if (!tempSections[chapterId]) {
      const sectionTitle = chapterId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      tempSections[chapterId] = {
        id: chapterId,
        title: sectionTitle,
        orderPrefix: chapterPrefix,
        codeExamples: [],
      };
    }
    tempSections[chapterId].codeExamples.push(codeExample);
  }
  console.log('[generate-data] Parsing complete.');

  console.log('[generate-data] Sorting data...');
  // ソート処理
  const sortedSections = Object.values(tempSections).sort((a, b) =>
    a.orderPrefix.localeCompare(b.orderPrefix)
  );
  for (const section of sortedSections) {
    section.codeExamples.sort((a, b) => {
      const aInfo = extractInfoFromPath(a.filePath);
      const bInfo = extractInfoFromPath(b.filePath);
      // filePath を削除する前にソート
      return aInfo && bInfo ? aInfo.examplePrefix.localeCompare(bInfo.examplePrefix) : 0;
    });
    // filePath は finalData 生成時に削除する
  }
  console.log('[generate-data] Sorting complete.');

  // 最終的なデータ形式 (CheatSheetSection[]) に変換し、filePath を除外
  const finalData: CheatSheetSection[] = sortedSections.map(({ id, orderPrefix, codeExamples, ...rest }) => ({
    ...rest,
    codeExamples: codeExamples.map(({ filePath, ...exRest }) => exRest), // ここで filePath を除外
  }));


  console.log('[generate-data] Writing JSON file...');
  // 出力ディレクトリが存在しない場合は作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`[generate-data] Created directory: ${outputDir}`);
  }

  // JSONファイルに書き出し
  fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2));
  console.log(`[generate-data] Successfully generated ${outputFile}`);
}

// スクリプトを実行
generateCheatSheetData().catch((error) => {
  console.error('[generate-data] Error generating cheat sheet data:', error);
  process.exit(1);
});