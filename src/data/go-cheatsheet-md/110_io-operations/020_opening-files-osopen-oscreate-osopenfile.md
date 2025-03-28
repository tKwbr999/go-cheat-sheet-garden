---
title: "Opening Files (os.Open, os.Create, os.OpenFile)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// より詳細な制御でファイルを開く
// 読み取り専用
fileRead, err := os.Open("filename.txt")
if err != nil { /* エラー処理 */
}
defer fileRead.Close()

// 書き込み用に開く (作成または切り捨て)
fileWrite, err := os.Create("output.txt")
if err != nil { /* エラー処理 */
}
defer fileWrite.Close()

// 特定のフラグとパーミッションで開く
fileAppend, err := os.OpenFile("file.txt", os.O_APPEND|os.O_WRONLY, 0644)
if err != nil { /* エラー処理 */
}
defer fileAppend.Close()
```