---
title: "Reading All from Reader (io.ReadAll)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// reader からすべて読み込む
reader := strings.NewReader("some data")
data, err := io.ReadAll(reader)
if err != nil { /* エラー処理 */
}
fmt.Println(string(data))
```