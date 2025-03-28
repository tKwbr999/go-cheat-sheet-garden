---
title: "Reading from File (file.Read)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// バッファを使用した読み込み
file, _ := os.Open("filename.txt")
defer file.Close()
buf := make([]byte, 1024)
n, err := file.Read(buf)
if err != nil && err != io.EOF {
	// エラー処理
}
// バッファを実際に読み取られたバイト数にリサイズ
readData := buf[:n]
fmt.Println(string(readData))
```