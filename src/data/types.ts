export interface CodeExample {
  title: string;
  code: string;
  description?: string;
  isCommentOnly?: boolean;
}

export interface CheatSheetSection {
  title: string;
  codeExamples: CodeExample[];
}

export interface CheatSheetData {
  sections: CheatSheetSection[];
}