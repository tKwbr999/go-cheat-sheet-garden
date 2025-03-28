---
title: "Buffered Scanner (bufio.NewScanner)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// 行ごとの読み込みのための Scanner
file, _ := os.Open("file.txt")
defer file.Close()
scanner := bufio.NewScanner(file)
for scanner.Scan() {
	line := scanner.Text()
	fmt.Println(line)
}
if err := scanner.Err(); err != nil {
	// エラー処理
}

// カスタム分割関数 (例: 単語ごと)
scanner.Split(bufio.ScanWords)
```