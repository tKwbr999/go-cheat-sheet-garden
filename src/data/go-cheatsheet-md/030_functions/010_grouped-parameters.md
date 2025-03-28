---
title: "関数: 引数の型指定をまとめる"
tags: ["functions", "func", "引数", "パラメータ"]
---

関数の引数リストを定義する際、**連続して同じ型**の引数が続く場合、Go言語では型指定をより簡潔に書くことができます。

## 型指定の省略ルール

連続する同じ型の引数がある場合、最後の引数を**除く**すべての引数で、型の記述を省略できます。最後の引数に型を指定すれば、それより前にある連続した同じ型の引数すべてにその型が適用されます。

**通常の書き方:**
```go
func add(a int, b int) int { ... }
func process(x int, y int, z int, message string) { ... }
```

**型指定をまとめた書き方:**
```go
func add(a, b int) int { ... } // a と b は両方とも int 型
func process(x, y, z int, message string) { ... } // x, y, z はすべて int 型
```

## コード例

```go title="引数の型指定をまとめる例"
package main

import "fmt"

// 通常の書き方
// func multiply(x int, y int) int {
// 	return x * y
// }

// 型指定をまとめた書き方
// x と y は両方とも int 型
func multiply(x, y int) int {
	return x * y
}

// 複数の型が混在する場合
// width と height は int 型、label は string 型
func drawRectangle(width, height int, label string) {
	fmt.Printf("長方形を描画: 幅=%d, 高さ=%d, ラベル=\"%s\"\n", width, height, label)
}

// 戻り値の型も同様にまとめられる (後のセクションで説明)
// func calculate(a, b int) (sum, diff int) { ... }

func main() {
	// multiply 関数を呼び出し
	product := multiply(6, 7)
	fmt.Printf("multiply(6, 7) = %d\n", product)

	// drawRectangle 関数を呼び出し
	drawRectangle(100, 50, "ボタン")
	drawRectangle(20, 30, "アイコン")
}

/* 実行結果:
multiply(6, 7) = 42
長方形を描画: 幅=100, 高さ=50, ラベル="ボタン"
長方形を描画: 幅=20, 高さ=30, ラベル="アイコン"
*/
```

**ポイント:**

*   `func multiply(x, y int)` は `func multiply(x int, y int)` と完全に同じ意味です。
*   `func drawRectangle(width, height int, label string)` では、`width` と `height` が連続して `int` 型なので、`height` の後にだけ `int` を書いています。`label` は型が異なるので、別途 `string` を指定しています。

この書き方はGoのコードで非常によく使われ、関数定義を少し短く、読みやすくするのに役立ちます。