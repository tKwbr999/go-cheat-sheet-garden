import { CheatSheetSection } from './types';
import basicsData from './go-cheatsheet/basics.json';
import basicTypesData from './go-cheatsheet/basic-types.json';
import flowControlData from './go-cheatsheet/flow-control.json';
import functionsData from './go-cheatsheet/functions.json';
import dataStructuresData from './go-cheatsheet/data-structures.json';
import packagesData from './go-cheatsheet/packages.json';
import concurrencyData from './go-cheatsheet/concurrency.json';
import errorHandlingData from './go-cheatsheet/error-handling.json';
import methodsData from './go-cheatsheet/methods.json';
import interfacesData from './go-cheatsheet/interfaces.json';
import contextData from './go-cheatsheet/context.json';
import ioOperationsData from './go-cheatsheet/io-operations.json';
import genericsData from './go-cheatsheet/generics.json';
import referencesData from './go-cheatsheet/references.json';

// データセクションの順序を定義
export const cheatSheetSectionOrder = [
  'basics',
  'basic-types',
  'flow-control',
  'functions',
  'data-structures',
  'methods',
  'interfaces',
  'packages',
  'error-handling',
  'concurrency',
  'context',
  'io-operations',
  'generics',
  'references'
];

// セクション名とデータのマッピング
// コードがコメントのみか判定するヘルパー関数
function isCodeCommentOnly(code: string): boolean {
  const trimmedCode = code.trim();
  if (trimmedCode === '') {
    return true; // 空文字列はコメントのみとみなす
  }
  return trimmedCode.split('\n').every(line => {
    const trimmedLine = line.trim();
    // コメント行または空行かチェック
    return trimmedLine.startsWith('//') || trimmedLine === '';
  });
}

// コメント内容を整形するヘルパー関数
function formatCommentContent(commentCode: string): string {
  return commentCode
    .split('\n')
    .map(line => line.trim().replace(/^\/\/\s*/, '')) // Remove '// ' or '//'
    .filter(line => line.trim() !== '') // Remove empty lines
    .join('\n');
}


// 元のデータを一時的に保持
const importedData: Record<string, { title: string; codeExamples: { title: string; code: string }[] }> = {
  'basics': basicsData,
  'basic-types': basicTypesData,
  'flow-control': flowControlData,
  'functions': functionsData,
  'data-structures': dataStructuresData,
  'packages': packagesData,
  'concurrency': concurrencyData,
  'context': contextData,
  'error-handling': errorHandlingData,
  'methods': methodsData,
  'interfaces': interfacesData,
  'io-operations': ioOperationsData,
  'generics': genericsData,
  'references': referencesData
};

// description プロパティを追加し、コメントのみのブロックを処理して新しいマップを作成
const sectionDataMap: Record<string, CheatSheetSection> = {};
for (const [sectionId, sectionData] of Object.entries(importedData)) {
  const processedExamples: { title: string; code: string; description?: string }[] = [];
  let previousExample: { title: string; code: string; description?: string } | null = null;

  for (const currentExample of sectionData.codeExamples) {
    if (isCodeCommentOnly(currentExample.code)) {
      // コメントのみのブロックの場合、前のブロックの description に設定
      if (previousExample) {
        previousExample.description = formatCommentContent(currentExample.code);
      }
      // コメントのみのブロック自体は processedExamples に追加しない
    } else {
      // 通常のコードブロックの場合
      const newExample = { ...currentExample, description: undefined }; // description を初期化
      processedExamples.push(newExample);
      previousExample = newExample; // 次の反復のために保持
    }
  }

  sectionDataMap[sectionId] = {
    ...sectionData,
    codeExamples: processedExamples,
  };
}

// チートシートの全データを順序通りに取得
export function getCheatSheetData(): CheatSheetSection[] {
  return cheatSheetSectionOrder.map(sectionId => sectionDataMap[sectionId]);
}

// 特定のセクションのデータを取得
export function getCheatSheetSection(sectionId: string): CheatSheetSection | undefined {
  return sectionDataMap[sectionId];
}

// IDによるセクションの検索
export function findSectionById(sectionId: string): CheatSheetSection | undefined {
  return sectionDataMap[sectionId];
}

// チートシートの全セクションタイトルを取得
export function getAllSectionTitles(): string[] {
  return cheatSheetSectionOrder.map(sectionId => sectionDataMap[sectionId].title);
}

// セクションIDからタイトルを取得
export function getSectionTitle(sectionId: string): string | undefined {
  const section = sectionDataMap[sectionId];
  return section ? section.title : undefined;
}

// セクションタイトルからIDを取得
export function getSectionIdByTitle(title: string): string | undefined {
  for (const [id, section] of Object.entries(sectionDataMap)) {
    if (section.title === title) {
      return id;
    }
  }
  return undefined;
}

// 特定のセクションの前後のセクションを取得
export function getAdjacentSections(sectionId: string): { prev?: string; next?: string } {
  const index = cheatSheetSectionOrder.indexOf(sectionId);
  if (index === -1) {
    return {};
  }

  const result: { prev?: string; next?: string } = {};
  
  if (index > 0) {
    result.prev = cheatSheetSectionOrder[index - 1];
  }
  
  if (index < cheatSheetSectionOrder.length - 1) {
    result.next = cheatSheetSectionOrder[index + 1];
  }
  
  return result;
}

// キーワードによるセクション検索
export function searchSections(keyword: string): CheatSheetSection[] {
  const normalizedKeyword = keyword.toLowerCase();
  
  return getCheatSheetData().filter(section => {
    // タイトルで検索
    if (section.title.toLowerCase().includes(normalizedKeyword)) {
      return true;
    }
    
    // 例のタイトルで検索
    for (const example of section.codeExamples) {
      if (example.title.toLowerCase().includes(normalizedKeyword)) {
        return true;
      }
      
      // コードの内容で検索
      if (example.code.toLowerCase().includes(normalizedKeyword)) {
        return true;
      }
    }
    
    return false;
  });
}