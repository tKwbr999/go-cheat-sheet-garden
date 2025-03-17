export interface CodeExample {
  title: string;
  code: string;
}

export interface CheatSheetSection {
  title: string;
  codeExamples: CodeExample[];
}

export interface CheatSheetData {
  sections: CheatSheetSection[];
}