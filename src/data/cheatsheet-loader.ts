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
import referencesData from './go-cheatsheet/references.json';

// データセクションの順序を定義
export const cheatSheetSectionOrder = [
  'basics',
  'basic-types',
  'flow-control',
  'functions',
  'data-structures',
  'packages',
  'concurrency',
  'error-handling',
  'methods',
  'interfaces',
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
  'error-handling': errorHandlingData as CheatSheetSection,
  'methods': methodsData as CheatSheetSection,
  'interfaces': interfacesData as CheatSheetSection,
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
