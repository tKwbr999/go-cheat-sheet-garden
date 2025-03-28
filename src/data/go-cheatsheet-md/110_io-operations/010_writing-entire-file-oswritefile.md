---
title: "Writing Entire File (os.WriteFile)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// ファイルへの書き込み
err = os.WriteFile("output.txt", []byte("Hello, world!"), 0644)
if err != nil {
	// エラー処理
}
```