## タイトル
title: 可変長引数と固定引数の組み合わせ

## タグ
tags: ["functions", "func", "引数", "パラメータ", "可変長引数", "...", "スライス"]

## コード
```go
package main

import (
	"fmt"
	"strings"
)

// 固定引数 prefix と 可変長引数 messages を組み合わせる
func printWithPrefix(prefix string, messages ...string) {
	fmt.Printf("[%s] ", prefix)
	if len(messages) > 0 {
		fmt.Println(strings.Join(messages, " "))
	} else {
		fmt.Println("(メッセージなし)")
	}
}

func main() {
	// 固定引数 + 個別の可変長引数
	printWithPrefix("INFO", "処理開始")
	printWithPrefix("DEBUG", "値:", "10")
	printWithPrefix("ERROR") // 可変長部分は0個

	// 固定引数 + スライス展開
	logMsgs := []string{"データ受信", "完了"}
	printWithPrefix("PROCESS", logMsgs...)
}

```

## 解説
```text
通常の**固定引数**と**可変長引数**を
組み合わせて関数を定義することも可能です。

**ルール: 可変長引数は最後に**
可変長引数 (`...型`) は、関数の引数リストの中で
**必ず最後に**記述する必要があります。
可変長引数の後に別の引数は定義できません。

**正しい例:**
`func process(id int, options ...string)`
`func log(level string, data ...any)`

**間違った例:**
`func wrong(values ...int, sep string)` // エラー

**コード例:**
`printWithPrefix` 関数は、必須の `prefix` (固定引数) と、
任意の個数の `messages` (可変長引数) を受け取ります。
関数内では `messages` は `[]string` スライスとして扱われます。

**呼び出し方:**
1.  **個別引数:** 固定引数の後に、可変長引数部分に
    0個以上の値をカンマ区切りで渡します。
    例: `printWithPrefix("DEBUG", "値:", "10")`
        `printWithPrefix("ERROR")`
2.  **スライス展開:** 固定引数の後に、スライス変数を
    `...` で展開して渡します。
    例: `printWithPrefix("PROCESS", logMsgs...)`

固定引数と可変長引数を組み合わせることで、
必須引数とオプション引数を区別するなど、
より柔軟な関数を設計できます。