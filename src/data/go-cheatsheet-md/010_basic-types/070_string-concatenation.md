---
title: "基本の型: 文字列の連結 (結合)"
tags: ["basic-types", "文字列", "string", "連結", "+", "strings.Builder", "strings.Join"]
---

複数の文字列を繋ぎ合わせて一つの新しい文字列を作成することを**文字列連結 (String Concatenation)** と呼びます。Go言語ではいくつかの方法で文字列を連結できます。

## `+` 演算子による連結

最も簡単な方法は、算術演算子の `+` を使うことです。`+` 演算子は、数値だけでなく文字列に対しても使うことができ、二つの文字列を繋ぎ合わせた**新しい文字列**を生成します。

```go title="+ 演算子による文字列連結"
package main

import "fmt"

func main() {
	s1 := "Hello"
	s2 := "World"
	space := " "

	// + 演算子を使って文字列を連結
	greeting := s1 + space + s2 + "!" // "Hello" + " " + "World" + "!"

	fmt.Println(greeting) // 出力: Hello World!

	// 元の文字列 s1, s2 は変更されない (文字列は不変)
	fmt.Println("元の s1:", s1)
	fmt.Println("元の s2:", s2)

	// += 演算子も使える (実際には新しい文字列が再代入される)
	message := "Go is "
	message += "fun!" // message = message + "fun!" と同じ
	fmt.Println(message) // 出力: Go is fun!
}

/* 実行結果:
Hello World!
元の s1: Hello
元の s2: World
Go is fun!
*/
```

**ポイント:**

*   `+` 演算子で文字列を連結すると、その都度**新しい文字列**がメモリ上に作成されます。元の文字列が変更されるわけではありません（文字列の不変性）。
*   `+=` 演算子も使えますが、これも内部的には `message = message + "..."` のように新しい文字列を作成して再代入しています。

## 多数の文字列を連結する場合の注意点と効率的な方法

`+` や `+=` による連結は、少数の文字列を繋ぎ合わせる場合には簡単で便利です。しかし、ループ処理の中などで**多数の文字列を繰り返し連結**する場合、そのたびに新しい文字列が生成されるため、**効率が悪くなる**可能性があります（メモリ確保とコピーが頻繁に発生するため）。

多数の文字列を効率的に連結するには、標準ライブラリの `strings` パッケージにある `Builder` 型や `Join` 関数を使うのが推奨されます。

### `strings.Builder`

`strings.Builder` は、内部的に効率的なバッファを持ち、文字列の断片を追記していくための型です。最後に `String()` メソッドを呼び出すことで、連結された最終的な文字列を取得できます。

```go title="strings.Builder を使った効率的な連結"
package main

import (
	"fmt"
	"strings" // strings パッケージをインポート
)

func main() {
	words := []string{"Go", "is", "fast", "and", "fun"}
	var builder strings.Builder // Builder を作成

	// ループで文字列を追記していく
	for i, word := range words {
		if i > 0 {
			builder.WriteString(" ") // 単語の間にスペースを追加
		}
		builder.WriteString(word) // 文字列を追記
	}

	// 最後に連結された文字列を取得
	result := builder.String()

	fmt.Println(result) // 出力: Go is fast and fun
}
```

### `strings.Join`

連結したい文字列が既にスライス（配列のようなもの）に格納されている場合は、`strings.Join` 関数を使うのが最も簡単で効率的です。

```go title="strings.Join を使った連結"
package main

import (
	"fmt"
	"strings"
)

func main() {
	words := []string{"Go", "is", "static", "typed"}
	separator := ", " // 各要素の間に挿入する区切り文字

	// スライスの要素を separator で連結
	result := strings.Join(words, separator)

	fmt.Println(result) // 出力: Go, is, static, typed
}
```

**まとめ:**

*   少数の文字列連結には `+` や `+=` が手軽。
*   多数の文字列を繰り返し連結する場合は `strings.Builder` が効率的。
*   文字列スライスの要素を連結する場合は `strings.Join` が便利。

状況に応じて適切な方法を選ぶことが重要です。