import { CheatSheetSection, CodeExample } from './types';
// 生成されたインデックスファイルをインポート
import sectionIndex from './generated/index.json';

// 型定義: インデックスファイルの型
interface SectionIndexItem {
  id: string;
  title: string;
  orderPrefix: string;
  filePath: string; // 遅延読み込み用のファイルパス (例: './sections/basics.json')
}

// --- データ処理 ---
// インデックスデータは静的に読み込まれる
const processedIndex: SectionIndexItem[] = sectionIndex as SectionIndexItem[];
const sectionMapById: Record<string, SectionIndexItem> = {};
const sectionMapByTitle: Record<string, SectionIndexItem> = {};
const sectionOrder: string[] = [];

// 一度だけインデックスを処理
processedIndex.forEach(item => {
  sectionMapById[item.id] = item;
  sectionMapByTitle[item.title] = item; // タイトルでの検索用
  sectionOrder.push(item.id);
});

// --- Public API (実装を修正) ---

// 全セクションのメタ情報（IDとタイトル）を返すように変更
// 注意: これは CheatSheetSection[] ではなくなるため、呼び出し元の修正が必要になる可能性がある
// もしくは、初期表示に必要な最低限の情報（タイトルリストなど）だけを返すようにする
export function getCheatSheetIndex(): SectionIndexItem[] {
  return processedIndex;
}

// 特定のセクションデータを非同期で読み込む
export async function getCheatSheetSection(sectionId: string): Promise<CheatSheetSection | undefined> {
  const indexItem = sectionMapById[sectionId];
  if (!indexItem) {
    return undefined;
  }
  const fetchUrl = indexItem.filePath; // この値を確認
  console.log(`Fetching section data from: ${fetchUrl}`); // デバッグログ追加
  try {
    // fetch API を使用して public ディレクトリのJSONファイルを取得
    // Acceptヘッダーを追加してJSONを期待することを明示
    const response = await fetch(indexItem.filePath, {
      headers: {
        'Accept': 'application/json',
      },
    }); // filePath は /data/sections/xxx.json 形式のはず
    if (!response.ok) {
      // レスポンスがJSONでない場合のエラーハンドリングを追加
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
         throw new Error(`Expected JSON but received ${contentType}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const sectionData = await response.json();
    return sectionData as CheatSheetSection;
  } catch (error) {
    console.error(`Error fetching section ${sectionId} from ${fetchUrl}:`, error); // fetchUrl をログに出力
    return undefined;
  }
}

// findSectionById は getCheatSheetSection を使う (非同期になる)
export async function findSectionById(sectionId: string): Promise<CheatSheetSection | undefined> {
  return getCheatSheetSection(sectionId);
}

// 全セクションのタイトルリストを返す (同期)
export function getAllSectionTitles(): string[] {
  return processedIndex.map((item) => item.title);
}

// セクションIDからタイトルを取得 (同期)
export function getSectionTitle(sectionId: string): string | undefined {
  return sectionMapById[sectionId]?.title;
}

// タイトルからセクションIDを取得 (同期)
export function getSectionIdByTitle(title: string): string | undefined {
  return sectionMapByTitle[title]?.id;
}

// 隣接セクションのIDを取得 (同期)
export function getAdjacentSections(sectionId: string): { prev?: string; next?: string } {
  const index = sectionOrder.indexOf(sectionId);
  if (index === -1) return {};
  const result: { prev?: string; next?: string } = {};
  if (index > 0) result.prev = sectionOrder[index - 1];
  if (index < sectionOrder.length - 1) result.next = sectionOrder[index + 1];
  return result;
}

// 検索機能: インデックス情報（タイトル）のみで検索する (同期)
// 注意: コンテンツ全体を検索する場合は、全JSONを読み込む非同期処理が必要
export function searchSections(keyword: string): SectionIndexItem[] {
  const normalizedKeyword = keyword.toLowerCase();
  if (!normalizedKeyword) return getCheatSheetIndex(); // キーワードがなければ全インデックスを返す

  return processedIndex.filter((item) => {
    if (item.title.toLowerCase().includes(normalizedKeyword)) return true;
    // IDでの検索も追加する場合
    // if (item.id.toLowerCase().includes(normalizedKeyword)) return true;
    return false;
  });
}

// 非同期で全セクションデータを読み込んで検索する関数の例 (必要に応じて実装)
/*
export async function searchSectionsDeep(keyword: string): Promise<CheatSheetSection[]> {
  const normalizedKeyword = keyword.toLowerCase();
  if (!normalizedKeyword) {
    // 全データを読み込む必要がある
    const allSections = await Promise.all(processedIndex.map(item => getCheatSheetSection(item.id)));
    return allSections.filter(s => s !== undefined) as CheatSheetSection[];
  }

  const results: CheatSheetSection[] = [];
  for (const item of processedIndex) {
    // まずタイトルでフィルタリング
    if (item.title.toLowerCase().includes(normalizedKeyword)) {
      const section = await getCheatSheetSection(item.id);
      if (section) results.push(section);
      continue; // タイトルが一致したらコンテンツは見ない（重複を避ける）
    }

    // コンテンツを検索するために読み込む
    const section = await getCheatSheetSection(item.id);
    if (!section) continue;

    let foundInContent = false;
    for (const example of section.codeExamples) {
      if (example.title.toLowerCase().includes(normalizedKeyword)) { foundInContent = true; break; }
      if (example.description?.toLowerCase().includes(normalizedKeyword)) { foundInContent = true; break; }
      if (example.code.toLowerCase().includes(normalizedKeyword)) { foundInContent = true; break; }
    }
    if (foundInContent) {
      results.push(section);
    }
  }
  return results;
}
*/
