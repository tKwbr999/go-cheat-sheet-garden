---
title: "Creating Directories (os.Mkdir, os.MkdirAll)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// ディレクトリを作成
err := os.Mkdir("my-single-dir", 0755)
if err != nil && !os.IsExist(err) { /* エラー処理 */
}

// ネストされたディレクトリを作成 (親が存在しなくてもOK)
err = os.MkdirAll("path/to/my/nested/dir", 0755)
if err != nil { /* エラー処理 */
}
```