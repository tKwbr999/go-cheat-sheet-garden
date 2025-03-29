## タイトル
title: 文字列の連結 (結合)

## タグ
tags: ["basic-types", "文字列", "string", "連結", "+", "strings.Builder", "strings.Join"]

## コード
```go
package main

import "fmt"

func main() {
	s1 := "Hello"
	s2 := "World"
	space := " "

	greeting := s1 + space + s2 + "!"
	fmt.Println(greeting) // Hello World!

	fmt.Println("元の s1:", s1) // 元の文字列は不変
	fmt.Println("元の s2:", s2)

	message := "Go is "
	message += "fun!" // += も使える
	fmt.Println(message) // Go is fun!
}
```

## 解説
```text
複数の文字列を繋ぎ合わせて一つの新しい文字列を
作成することを**文字列連結**と呼びます。

**`+` 演算子による連結:**
最も簡単な方法です。`+` 演算子は文字列を
繋ぎ合わせた**新しい文字列**を生成します。
元の文字列は変更されません (不変性)。
`+=` 演算子も使えますが、内部的には
新しい文字列を作成して再代入しています。

**多数の文字列を連結する場合:**
ループ内で `+` や `+=` を繰り返し使うと、
その都度新しい文字列が生成されるため、
**効率が悪くなる**可能性があります。

**効率的な方法:**
*   **`strings.Builder`**:
    内部バッファに文字列断片を効率的に追記し、
    最後に `String()` で結果を取得します。
    多数の文字列を**繰り返し**連結する場合に推奨されます。
*   **`strings.Join`**:
    文字列スライス (`[]string`) の要素を、
    指定した区切り文字で連結します。
    **スライス要素の連結**に最も簡単で効率的です。

**まとめ:**
*   少数連結: `+`, `+=` (手軽)
*   多数連結(ループ等): `strings.Builder` (効率的)
*   スライス連結: `strings.Join` (便利)

状況に応じて適切な方法を選びましょう。