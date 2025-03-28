---
title: "Reading Directory Entries (os.ReadDir, Go 1.16+)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// ディレクトリエントリを読み込む (Go 1.16+)
entries, err := os.ReadDir(".") // 現在のディレクトリ
if err != nil { /* エラー処理 */
}

for _, entry := range entries {
	fmt.Printf("Name: %s, IsDir: %v\n", entry.Name(), entry.IsDir())
	// 詳細情報が必要な場合
	// info, err := entry.Info()
	// if err == nil {
	//   fmt.Println(" Size:", info.Size())
	// }
}
```