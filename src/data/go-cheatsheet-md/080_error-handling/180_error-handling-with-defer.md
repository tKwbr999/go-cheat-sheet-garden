---
title: "Error Handling with defer" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// defer を使用したエラー処理 (リソースクリーンアップ)
func processFile(filename string) (err error) {
	f, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}

	defer func() {
		closeErr := f.Close()
		if err == nil && closeErr != nil {
			// 他にエラーがない場合、close エラーを呼び出し元に渡す
			err = fmt.Errorf("failed to close file: %w", closeErr)
		}
		// 既にエラーがある場合は、元のエラーを保持する
	}()

	// ファイルを処理...
	// _, err = io.Copy(dst, f)
	// if err != nil {
	//   return fmt.Errorf("failed to process file: %w", err)
	// }

	return nil // 正常終了
}
```