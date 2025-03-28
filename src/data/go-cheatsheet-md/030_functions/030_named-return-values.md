---
title: "関数: 名前付き戻り値 (Named Return Values)"
tags: ["functions", "func", "戻り値", "return", "naked return"]
---

Goの関数では、戻り値に**名前**を付けることができます。これは**名前付き戻り値 (Named Return Values)** と呼ばれ、いくつかの特徴があります。

## 名前付き戻り値の構文

関数宣言の戻り値指定部分で、型だけでなく変数名も一緒に記述します。

**構文:**
```go
func 関数名(引数リスト) (戻り値名1 型1, 戻り値名2 型2, ...) {
	// ... 関数本体 ...
	// 戻り値名1 = 値1
	// 戻り値名2 = 値2
	// ...
	return // 値を指定しない return (Naked Return) が可能
}
```

*   `(戻り値名1 型1, 戻り値名2 型2, ...)`: 戻り値の変数名とその型を指定します。
*   関数が呼び出されると、これらの名前付き戻り値変数は、それぞれの型の**ゼロ値**で初期化され、関数内で通常のローカル変数のように扱うことができます。
*   関数本体でこれらの戻り値変数に値を代入します。
*   **Naked Return:** 名前付き戻り値を使っている場合、`return` 文で返す値を**省略**できます (`return` とだけ書く)。この場合、その時点での名前付き戻り値変数の現在の値が自動的に返されます。

## コード例

前のセクションの `divideAndRemainder` 関数を名前付き戻り値を使って書き換えてみましょう。

```go title="名前付き戻り値と Naked Return"
package main

import (
	"errors"
	"fmt"
)

// 名前付き戻り値 (quotient, remainder, err) を使用
func divideAndRemainderNamed(a, b int) (quotient, remainder int, err error) {
	// 関数開始時、quotient=0, remainder=0, err=nil で初期化されている

	if b == 0 {
		// 戻り値変数 err にエラーを設定
		err = errors.New("ゼロ除算エラー")
		// Naked Return: quotient(0), remainder(0), err(エラー情報) が返される
		return
	}

	// 戻り値変数 quotient と remainder に値を代入
	quotient = a / b
	remainder = a % b
	// err は初期値 nil のまま

	// Naked Return: quotient(計算結果), remainder(計算結果), err(nil) が返される
	return
}

func main() {
	q1, r1, err1 := divideAndRemainderNamed(10, 3)
	if err1 != nil {
		fmt.Println("エラー:", err1)
	} else {
		fmt.Printf("10 ÷ 3 = 商 %d, 余り %d\n", q1, r1)
	}

	q2, r2, err2 := divideAndRemainderNamed(5, 0)
	if err2 != nil {
		fmt.Println("エラー:", err2)
	} else {
		fmt.Printf("5 ÷ 0 = 商 %d, 余り %d\n", q2, r2)
	}

	// もちろん、Naked Return せずに値を指定して return も可能
	// func example() (x int) {
	//   x = 10
	//   return x // OK
	// }
	// func example2() (x int) {
	//   y := 20
	//   return y // OK: x に y の値が代入されてから返されるわけではない
	// }
}

/* 実行結果:
10 ÷ 3 = 商 3, 余り 1
エラー: ゼロ除算エラー
*/
```

**コード解説:**

*   `func divideAndRemainderNamed(...) (quotient, remainder int, err error)`: `quotient`, `remainder`, `err` という名前で戻り値を宣言しています。関数が始まる時点で、これらは `0`, `0`, `nil` で初期化されます。
*   `if b == 0 { err = errors.New(...); return }`: `b` が 0 の場合、戻り値変数 `err` にエラー値を代入し、`return` (Naked Return) します。この時点で `quotient` と `remainder` はゼロ値の `0` のままなので、`(0, 0, エラー情報)` が返されます。
*   `quotient = a / b; remainder = a % b; return`: 正常な場合、計算結果を戻り値変数 `quotient` と `remainder` に代入し、`return` (Naked Return) します。`err` は `nil` のままなので、`(計算結果の商, 計算結果の余り, nil)` が返されます。

## 利点と注意点

**利点:**

*   **ドキュメントとしての役割:** 戻り値に名前が付いていることで、その関数が何を返すのかがより明確になる場合があります（特に複数の同じ型の値を返す場合など）。Goのドキュメントツール (`godoc`) などでも、これらの名前が表示されます。
*   **Naked Return による簡潔化:** 短い関数であれば、`return` 文で値を繰り返す必要がなくなり、コードが少し簡潔になることがあります。

**注意点:**

*   **Naked Return の乱用:** 長い関数や複雑な関数で Naked Return を多用すると、`return` 文を見ただけでは実際にどの値が返されるのかが分かりにくくなり、**可読性が低下する**可能性があります。どの変数がいつ変更されたかを追うのが難しくなるためです。
*   **意図しない値の返却:** 関数内で戻り値変数を変更した後、それを意図せずに Naked Return してしまう可能性があります。

**推奨:**

一般的に、**Naked Return は短い単純な関数でのみ使用**し、少しでも関数が長くなったり複雑になったりする場合は、**`return` 文で返す値を明示的に指定する**方が、コードの明確さと保守性の観点から推奨されます。名前付き戻り値自体は、ドキュメント目的で使うことは有効です。

```go
// Naked Return ではなく、値を明示的に返す方が推奨される場合が多い
func divideAndRemainderExplicit(a, b int) (quotient, remainder int, err error) {
	if b == 0 {
		err = errors.New("ゼロ除算エラー")
		// 値を明示的に返す (quotient, remainder はゼロ値)
		return 0, 0, err
	}
	quotient = a / b
	remainder = a % b
	// 値を明示的に返す (err は nil)
	return quotient, remainder, nil
}