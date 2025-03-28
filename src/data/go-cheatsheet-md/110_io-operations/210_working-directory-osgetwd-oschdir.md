---
title: "Working Directory (os.Getwd, os.Chdir)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// 現在のディレクトリを取得
currentDir, err := os.Getwd()
if err != nil { /* エラー処理 */
}
fmt.Println("Current dir:", currentDir)

// ディレクトリを変更
err = os.Chdir("path/to/my") // 存在すると仮定
if err != nil { /* エラー処理 */
}
newDir, _ := os.Getwd()
fmt.Println("New dir:", newDir)
```