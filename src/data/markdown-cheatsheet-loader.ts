// gray-matter の依存を削除
// import matter from 'gray-matter';
import { marked } from 'marked';
import { CheatSheetSection, CodeExample } from './types';

// 型定義 (変更なし)
interface InternalCodeExample extends CodeExample {
  tags: string[];
  filePath: string;
}

interface InternalCheatSheetSection extends Omit<CheatSheetSection, 'codeExamples'> {
  id: string;
  orderPrefix: string;
  codeExamples: InternalCodeExample[];
}

// Viteの import.meta.glob (変更なし)
const modules = import.meta.glob('/src/data/go-cheatsheet-md/**/*.md', { query: '?raw', import: 'default', eager: true }); // eager: true を追加 (重要)

// キャッシュ変数 (変更なし)
let cachedSections: InternalCheatSheetSection[] | null = null;
let cachedSectionMap: Record<string, InternalCheatSheetSection> | null = null;
let cachedSectionOrder: string[] | null = null;

// ファイルパスからの情報抽出 (変更なし)
function extractInfoFromPath(filePath: string): { chapterId: string; chapterPrefix: string; examplePrefix: string; exampleSlug: string } | null {
  const match = filePath.match(/\/(\d{3})_([^/]+)\/(\d{3})_([^/]+)\.md$/);
  if (!match) {
    console.warn(`Could not parse path: ${filePath}`);
    return null;
  }
  return {
    chapterPrefix: match[1],
    chapterId: match[2],
    examplePrefix: match[3],
    exampleSlug: match[4],
  };
}

// --- 自前の簡易Front Matterパーサー (変更なし) ---
interface ParsedFrontMatter {
  title?: string;
  tags?: string[];
}

function parseFrontMatter(content: string): { data: ParsedFrontMatter; content: string } {
  const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
  const match = content.match(frontMatterRegex);

  const data: ParsedFrontMatter = {};
  let markdownContent = content;

  if (match) {
    markdownContent = content.slice(match[0].length).trim();
    const yamlLines = match[1].trim().split('\n');
    yamlLines.forEach(line => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex > 0) {
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).split('#')[0].trim(); // 行末コメントを除去
        if (key === 'title') {
          data.title = value.replace(/^['"]|['"]$/g, '');
        } else if (key === 'tags') {
          try {
            const parsedTags = JSON.parse(value.replace(/'/g, '"'));
            if (Array.isArray(parsedTags)) {
              data.tags = parsedTags.map(String);
            }
          } catch (e) {
            console.warn(`Could not parse tags: ${value}`, e);
          }
        }
      }
    });
  }

  return { data, content: markdownContent };
}
// --- ここまで自前パーサー ---


// Markdownコンテンツからの説明とコード抽出 (変更なし)
function extractDescriptionAndCode(markdownContent: string): { description?: string; code: string } {
  const tokens = marked.lexer(markdownContent);
  let description = '';
  let code = '';
  let codeBlockFound = false;
  for (const token of tokens) {
    if (token.type === 'code' && token.lang === 'go') {
      code = token.text;
      codeBlockFound = true;
      break;
    } else if (!codeBlockFound && token.type === 'paragraph') {
      description += (description ? '\n' : '') + token.text;
    }
  }
  return { description: description.trim() || undefined, code };
}

// Markdownファイルを解析し、データを構築する関数 (型チェックを追加)
function loadAndParseCheatSheet(): { sections: InternalCheatSheetSection[]; sectionMap: Record<string, InternalCheatSheetSection>; sectionOrder: string[] } {
  if (cachedSections && cachedSectionMap && cachedSectionOrder) {
    return { sections: cachedSections, sectionMap: cachedSectionMap, sectionOrder: cachedSectionOrder };
  }

  const tempSections: Record<string, InternalCheatSheetSection> = {};

  for (const filePath in modules) {
    const fileContent = modules[filePath]; // as unknown as string を削除
    const pathInfo = extractInfoFromPath(filePath);

    if (!pathInfo) continue;

    // --- ここから追加 ---
    // fileContent が文字列であることを確認
    if (typeof fileContent !== 'string') {
      console.warn(`Skipping ${filePath}: Content is not a string (type: ${typeof fileContent}).`);
      continue;
    }
    // --- ここまで追加 ---

    const { chapterId, chapterPrefix } = pathInfo;
    // 自前のパーサーを使用 (ここでは fileContent は string であることが保証される)
    const { data: frontMatter, content: markdownContent } = parseFrontMatter(fileContent);

    if (!frontMatter.title) {
      console.warn(`Skipping ${filePath}: Missing or invalid 'title' in front matter.`);
      continue;
    }

    const { description, code } = extractDescriptionAndCode(markdownContent);

    if (!code) {
      console.warn(`Skipping ${filePath}: No Go code block found.`);
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
      filePath,
    };

    if (!tempSections[chapterId]) {
      const sectionTitle = chapterId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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

  // ソート処理 (変更なし)
  const sortedSections = Object.values(tempSections).sort((a, b) =>
    a.orderPrefix.localeCompare(b.orderPrefix)
  );
  for (const section of sortedSections) {
    section.codeExamples.sort((a, b) => {
      const aInfo = extractInfoFromPath(a.filePath);
      const bInfo = extractInfoFromPath(b.filePath);
      return aInfo && bInfo ? aInfo.examplePrefix.localeCompare(bInfo.examplePrefix) : 0;
    });
  }

  const sectionMap: Record<string, InternalCheatSheetSection> = {};
  const sectionOrder: string[] = [];
  for (const section of sortedSections) {
    sectionMap[section.id] = section;
    sectionOrder.push(section.id);
  }

  cachedSections = sortedSections;
  cachedSectionMap = sectionMap;
  cachedSectionOrder = sectionOrder;

  return { sections: cachedSections, sectionMap: cachedSectionMap, sectionOrder: cachedSectionOrder };
}

// --- Public API (インターフェースは変更なし) ---
// 実装は変更なし
export function getCheatSheetData(): CheatSheetSection[] {
  const { sections } = loadAndParseCheatSheet();
  return sections.map(({ id, orderPrefix, codeExamples, ...rest }) => ({
    ...rest,
    codeExamples: codeExamples.map(({ filePath, ...exRest }) => exRest)
  }));
}

export function getCheatSheetSection(sectionId: string): CheatSheetSection | undefined {
  const { sectionMap } = loadAndParseCheatSheet();
  const section = sectionMap[sectionId];
  return section ? {
    title: section.title,
    codeExamples: section.codeExamples.map(({ filePath, ...exRest }) => exRest)
   } : undefined;
}

export function findSectionById(sectionId: string): CheatSheetSection | undefined {
  return getCheatSheetSection(sectionId);
}

export function getAllSectionTitles(): string[] {
  const { sections } = loadAndParseCheatSheet();
  return sections.map(section => section.title);
}

export function getSectionTitle(sectionId: string): string | undefined {
  const { sectionMap } = loadAndParseCheatSheet();
  return sectionMap[sectionId]?.title;
}

export function getSectionIdByTitle(title: string): string | undefined {
  const { sections } = loadAndParseCheatSheet();
  const section = sections.find(s => s.title === title);
  return section?.id;
}

export function getAdjacentSections(sectionId: string): { prev?: string; next?: string } {
  const { sectionOrder } = loadAndParseCheatSheet();
  const index = sectionOrder.indexOf(sectionId);
  if (index === -1) return {};
  const result: { prev?: string; next?: string } = {};
  if (index > 0) result.prev = sectionOrder[index - 1];
  if (index < sectionOrder.length - 1) result.next = sectionOrder[index + 1];
  return result;
}

export function searchSections(keyword: string): CheatSheetSection[] {
  const { sections } = loadAndParseCheatSheet();
  const normalizedKeyword = keyword.toLowerCase();
  if (!normalizedKeyword) return getCheatSheetData();
  const results = sections.filter(section => {
    if (section.title.toLowerCase().includes(normalizedKeyword)) return true;
    for (const example of section.codeExamples) {
      if (example.title.toLowerCase().includes(normalizedKeyword)) return true;
      if (example.description?.toLowerCase().includes(normalizedKeyword)) return true;
      if (example.code.toLowerCase().includes(normalizedKeyword)) return true;
      if (example.tags.some(tag => tag.toLowerCase().includes(normalizedKeyword))) return true;
    }
    return false;
  });
  return results.map(({ id, orderPrefix, codeExamples, ...rest }) => ({
    ...rest,
    codeExamples: codeExamples.map(({ filePath, ...exRest }) => exRest)
  }));
}

export function clearCache(): void {
  cachedSections = null;
  cachedSectionMap = null;
  cachedSectionOrder = null;
}