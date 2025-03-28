---
title: "Defer for Cleanup" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// Defer 文は、囲んでいる関数が戻る前に関数を実行する
// クリーンアップ操作に使用される (ファイル、接続などを閉じる)
func ReadFile(filename string) ([]byte, error) {
	f, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	// f.Close() は ReadFile が戻るときに実行される
	defer f.Close()

	return io.ReadAll(f)
}
```