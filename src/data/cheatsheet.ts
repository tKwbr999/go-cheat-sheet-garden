// このファイルは後方互換性のために残しています
// 新しいデータ構造は data/cheatsheet-loader.ts を使用してください
import { CheatSheetSection } from './types';
import { getCheatSheetData } from './cheatsheet-loader';

// 互換性のためにデータをエクスポート
export const cheatSheetData: CheatSheetSection[] = getCheatSheetData();
