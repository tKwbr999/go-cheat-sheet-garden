---
title: "関数: 可変長引数と固定引数の組み合わせ"
tags: ["functions", "func", "引数", "パラメータ", "可変長引数", "...", "スライス"]
---

可変長引数は非常に便利ですが、常にすべての引数を可変長にする必要はありません。通常の**固定引数**と**可変長引数**を組み合わせて関数を定義することも可能です。

## 定義のルール: 可変長引数は最後に

重要なルールとして、可変長引数 (`...型`) は、関数の引数リストの中で**必ず最後に**記述する必要があります。可変長引数の後に、さらに別の引数を定義することはできません。

**正しい例:**
```go
func process(id int, name string, options ...string) { ... } // OK: 可変長引数は最後
func log(level string, messages ...any) { ... }           // OK: 可変長引数は最後
```

**間違った例:**
```go
// func wrong(values ...int, separator string) { ... } // コンパイルエラー: 可変長引数の後に引数を定義できない
```

## コード例: プレフィックス付きメッセージ表示

例として、必須のプレフィックス文字列と、その後に続く任意の個数のメッセージ文字列を受け取り、整形して表示する関数を考えてみましょう。

```go title="固定引数と可変長引数の組み合わせ"
package main

import (
	"fmt"
	"strings"
)

// 最初の引数 prefix (string) は必須の固定引数
// それ以降の messages (...string) は任意の個数の可変長引数
func printWithPrefix(prefix string, messages ...string) {
	fmt.Printf("プレフィックス: [%s]\n", prefix)

	if len(messages) > 0 {
		// messages は []string スライスとして扱われる
		fullMessage := strings.Join(messages, " ") // メッセージをスペースで連結
		fmt.Printf("メッセージ: %s\n", fullMessage)
	} else {
		fmt.Println("(メッセージはありません)")
	}
	fmt.Println("---")
}

func main() {
	// --- 呼び出し方 ---

	// 1. 固定引数 + 個別の可変長引数
	printWithPrefix("INFO", "処理を開始します。")
	printWithPrefix("DEBUG", "変数 x =", "10") // 可変長部分に複数の引数
	printWithPrefix("ERROR")                  // 可変長部分に引数なし (messages は空スライスになる)

	// 2. 固定引数 + スライス展開
	logMessages := []string{"データ受信", "解析中...", "完了"}
	printWithPrefix("PROCESS", logMessages...) // logMessages スライスを展開して渡す

	// 3. 固定引数 + 空スライス展開
	emptyMessages := []string{}
	printWithPrefix("EMPTY", emptyMessages...)
}

/* 実行結果:
プレフィックス: [INFO]
メッセージ: 処理を開始します。
---
プレフィックス: [DEBUG]
メッセージ: 変数 x = 10
---
プレフィックス: [ERROR]
(メッセージはありません)
---
プレフィックス: [PROCESS]
メッセージ: データ受信 解析中... 完了
---
プレフィックス: [EMPTY]
(メッセージはありません)
---
*/
```

**コード解説:**

*   `func printWithPrefix(prefix string, messages ...string)`:
    *   `prefix string`: 最初の引数は `string` 型の固定引数です。呼び出し時に必ず値を一つ渡す必要があります。
    *   `messages ...string`: 2番目以降の引数は `string` 型の可変長引数です。0個以上の `string` を渡すことができます。関数内では `messages` は `[]string` スライスとして扱われます。
*   **呼び出し:**
    *   `printWithPrefix("INFO", "処理を開始します。")`: 固定引数 `prefix` に `"INFO"` を、可変長引数 `messages` に `"処理を開始します。"` を一つ渡しています。`messages` は `["処理を開始します。"]` というスライスになります。
    *   `printWithPrefix("DEBUG", "変数 x =", "10")`: 固定引数 `prefix` に `"DEBUG"` を、可変長引数 `messages` に `"変数 x ="` と `"10"` の二つを渡しています。`messages` は `["変数 x =", "10"]` というスライスになります。
    *   `printWithPrefix("ERROR")`: 固定引数 `prefix` に `"ERROR"` を渡しています。可変長引数 `messages` には何も渡していないため、`messages` は `[]` (空のスライス) になります。
    *   `printWithPrefix("PROCESS", logMessages...)`: 固定引数 `prefix` に `"PROCESS"` を渡し、`logMessages` スライスを `...` で展開して可変長引数 `messages` に渡しています。

固定引数と可変長引数を組み合わせることで、必須の引数とオプションの引数を区別したり、より柔軟なインターフェースを持つ関数を設計したりすることができます。