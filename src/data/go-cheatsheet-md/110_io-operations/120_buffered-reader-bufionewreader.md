---
title: "Buffered Reader (bufio.NewReader)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// バッファ付き読み込み
file, _ := os.Open("file.txt")
defer file.Close()
reader := bufio.NewReader(file)

// 1バイト読み込み
b, err := reader.ReadByte()

// 区切り文字まで読み込み (例: 改行)
line, err := reader.ReadString('\n')
```