---
title: "Buffered Writer (bufio.NewWriter)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// バッファ付き書き込み
file, _ := os.Create("output.txt")
defer file.Close()
writer := bufio.NewWriter(file)

// 文字列を書き込む
n, err := writer.WriteString("Hello, world!\n")

// バイトを書き込む
err = writer.WriteByte('X')

// バッファを基底の writer にフラッシュ (重要!)
err = writer.Flush()
if err != nil {
  // エラー処理
}
```