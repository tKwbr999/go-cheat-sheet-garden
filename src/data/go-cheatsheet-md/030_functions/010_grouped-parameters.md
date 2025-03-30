## タイトル
title: 引数の型指定をまとめる

## タグ
tags: ["functions", "func", "引数", "パラメータ"]

## コード
```go
package main

import "fmt"

// x と y は両方とも int 型
func multiply(x, y int) int {
	return x * y
}

// width と height は int 型、label は string 型
func drawRectangle(width, height int, label string) {
	fmt.Printf("描画: 幅=%d, 高さ=%d, ラベル=\"%s\"\n", width, height, label)
}

func main() {
	product := multiply(6, 7)
	fmt.Printf("multiply(6, 7) = %d\n", product)

	drawRectangle(100, 50, "ボタン")
}

```

## 解説
```text
関数の引数リストで、**連続して同じ型**の引数が続く場合、
型指定を簡潔に書けます。

**ルール:**
連続する同じ型の引数がある場合、最後の引数を**除く**
すべての引数で型の記述を省略できます。
最後の引数に型を指定すれば、それより前の連続した
同じ型の引数すべてにその型が適用されます。

**例:**
*   通常の書き方: `func add(a int, b int)`
*   まとめた書き方: `func add(a, b int)`
    (a と b は両方 int 型)

*   通常の書き方: `func process(x int, y int, z int, msg string)`
*   まとめた書き方: `func process(x, y, z int, msg string)`
    (x, y, z はすべて int 型)

コード例の `multiply(x, y int)` や
`drawRectangle(width, height int, label string)` も
このルールに従っています。

この書き方はGoで非常によく使われ、関数定義を
少し短く読みやすくするのに役立ちます。