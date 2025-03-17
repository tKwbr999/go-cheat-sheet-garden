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
const sectionDataMap: Record<string, CheatSheetSection> = {
  'basics': basicsData as CheatSheetSection,
  'basic-types': basicTypesData as CheatSheetSection,
  'flow-control': flowControlData as CheatSheetSection,
  'functions': functionsData as CheatSheetSection,
  'data-structures': dataStructuresData as CheatSheetSection,
  'packages': packagesData as CheatSheetSection,
  'concurrency': concurrencyData as CheatSheetSection,
  'context': contextData as CheatSheetSection,
  'error-handling': errorHandlingData as CheatSheetSection,
  'methods': methodsData as CheatSheetSection,
  'interfaces': interfacesData as CheatSheetSection,
  'io-operations': ioOperationsData as CheatSheetSection,
  'generics': genericsData as CheatSheetSection,
  'references': referencesData as CheatSheetSection
};

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