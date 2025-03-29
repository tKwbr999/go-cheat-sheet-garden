import { CheatSheetSection, CodeExample } from './types';
// 生成されたJSONデータをインポート
import generatedData from './generated/cheatsheet-data.json';

// --- 型定義 (必要に応じて調整) ---
// Internal* 型は不要になる可能性がある
interface InternalCheatSheetSection extends CheatSheetSection {
  id: string; // 検索や隣接セクション取得のためにIDを付与
}

// --- データ処理 ---
// JSONデータを一度だけ処理して使いやすい形式にする
let processedSections: InternalCheatSheetSection[] | null = null;
let sectionMap: Record<string, InternalCheatSheetSection> | null = null;
let sectionOrder: string[] | null = null;

function processGeneratedData(): {
  sections: InternalCheatSheetSection[];
  sectionMap: Record<string, InternalCheatSheetSection>;
  sectionOrder: string[];
} {
  if (processedSections && sectionMap && sectionOrder) {
    return { sections: processedSections, sectionMap, sectionOrder };
  }

  // generatedData を InternalCheatSheetSection[] に変換 (IDを付与)
  // 注意: generatedData は CheatSheetSection[] 型のはず
  const sectionsWithId: InternalCheatSheetSection[] = (generatedData as CheatSheetSection[]).map(section => ({
    ...section,
    // IDをタイトルから生成（または別の方法で保持） - ここでは単純化のためタイトルをIDとする
    // もし元の orderPrefix や chapterId が必要なら、生成スクリプトでJSONに含める必要がある
    id: section.title.toLowerCase().replace(/\s+/g, '-'), // 例: "Basic Types" -> "basic-types"
  }));

  const map: Record<string, InternalCheatSheetSection> = {};
  const order: string[] = [];
  for (const section of sectionsWithId) {
    map[section.id] = section;
    order.push(section.id);
  }

  processedSections = sectionsWithId;
  sectionMap = map;
  sectionOrder = order;

  return { sections: processedSections, sectionMap, sectionOrder };
}


// --- Public API (インターフェースは変更なし、実装を修正) ---

export function getCheatSheetData(): CheatSheetSection[] {
  // JSONデータを直接返す (IDを除外)
  return (generatedData as CheatSheetSection[]);
}

export function getCheatSheetSection(sectionId: string): CheatSheetSection | undefined {
  const { sectionMap } = processGeneratedData();
  const section = sectionMap[sectionId];
  // IDを除外して返す
  if (!section) return undefined;
  const { id, ...rest } = section;
  return rest;
}

export function findSectionById(sectionId: string): CheatSheetSection | undefined {
  return getCheatSheetSection(sectionId);
}

export function getAllSectionTitles(): string[] {
  const { sections } = processGeneratedData();
  return sections.map((section) => section.title);
}

export function getSectionTitle(sectionId: string): string | undefined {
  const { sectionMap } = processGeneratedData();
  return sectionMap[sectionId]?.title;
}

export function getSectionIdByTitle(title: string): string | undefined {
  const { sections } = processGeneratedData();
  // ID生成ロジックに合わせて検索
  const targetId = title.toLowerCase().replace(/\s+/g, '-');
  const section = sections.find((s) => s.id === targetId);
  return section?.id;
}

export function getAdjacentSections(sectionId: string): { prev?: string; next?: string } {
  const { sectionOrder } = processGeneratedData();
  const index = sectionOrder.indexOf(sectionId);
  if (index === -1) return {};
  const result: { prev?: string; next?: string } = {};
  if (index > 0) result.prev = sectionOrder[index - 1];
  if (index < sectionOrder.length - 1) result.next = sectionOrder[index + 1];
  return result;
}

export function searchSections(keyword: string): CheatSheetSection[] {
  const { sections } = processGeneratedData(); // InternalCheatSheetSection[] を取得
  const normalizedKeyword = keyword.toLowerCase();
  if (!normalizedKeyword) return getCheatSheetData(); // 元のデータを返す

  const results = sections.filter((section) => {
    // section.id も検索対象に含めるか検討
    if (section.title.toLowerCase().includes(normalizedKeyword)) return true;
    for (const example of section.codeExamples) {
      if (example.title.toLowerCase().includes(normalizedKeyword)) return true;
      if (example.description?.toLowerCase().includes(normalizedKeyword)) return true;
      if (example.code.toLowerCase().includes(normalizedKeyword)) return true;
      // タグ情報が必要な場合は、生成スクリプトでJSONに含める必要がある
      // if (example.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))) return true;
    }
    return false;
  });

  // 結果を CheatSheetSection[] 形式に戻す (IDを除外)
  return results.map(({ id, ...rest }) => rest);
}

// キャッシュクリア関数は不要になるため削除
// export function clearCache(): void { ... }
