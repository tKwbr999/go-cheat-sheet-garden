## タイトル
title: 関数: 可変長引数 (スライス) の一部を渡す

## タグ
tags: ["functions", "func", "引数", "パラメータ", "可変長引数", "...", "スライス", "スライス操作"]

## コード
```go
package main

import (
	"fmt"
	"strings"
)

// joinStrings は可変長引数を受け取り連結する (例)
func joinStrings(strs ...string) string {
	return strings.Join(strs, " ")
}

// title と body (可変長) を受け取る関数
func processDocument(title string, body ...string) {
	fmt.Printf("\nタイトル: %s\n", title)
	if len(body) >= 2 {
		// body スライスの最初の2要素を取得 (body[:2]) し、
		// それを ... で展開して joinStrings に渡す
		firstTwo := joinStrings(body[:2]...)
		fmt.Printf("冒頭2単語: \"%s\"\n", firstTwo)

		// 同様に body[1:]... で2単語目以降を渡すことも可能
	} else if len(body) > 0 {
		fmt.Printf("本文: \"%s\"\n", joinStrings(body...))
	} else {
		fmt.Println("本文なし")
	}
}

func main() {
	processDocument("レポート", "これは", "テスト", "です")
	processDocument("短いメモ", "重要")
}

```

## 解説
```text
可変長引数 (`...T`) は関数内部では
スライス (`[]T`) として扱われます。
そのため、通常のスライス操作 (`[i:j]`) を適用できます。

**スライス操作のおさらい:**
*   `s[i:j]`: インデックス `i` から `j-1` までの要素。
*   `s[i:]`: インデックス `i` から最後まで。
*   `s[:j]`: 最初からインデックス `j-1` まで。

**可変長引数スライスの一部を渡す:**
1. 受け取った可変長引数 (スライス) に対し、
   スライス操作 (`[i:j]`) で部分スライスを取得。
2. その部分スライスを、別の可変長引数関数を
   呼び出す際に `...` を付けて展開する。

コード例の `processDocument` 関数では、
可変長引数 `body` (`[]string`) を受け取ります。
`len(body) >= 2` の場合、`body[:2]` で
最初の2要素を持つ新しいスライスを作成し、
それを `joinStrings(body[:2]...)` のように `...` を
付けて `joinStrings` 関数に渡しています。
`joinStrings` 関数は `"これは"`, `"テスト"` という
2つの `string` 引数を受け取ることになります。

同様に `body[1:]...` とすれば、2番目以降の要素を
展開して渡すことも可能です。

このように、可変長引数はスライスとして扱えるため、
柔軟な引数の受け渡しが実現できます。