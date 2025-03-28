---
title: "関数: 関数を戻り値として返す (高階関数, クロージャ生成)"
tags: ["functions", "func", "関数型", "戻り値", "高階関数", "クロージャ"]
---

Go言語では、関数は第一級オブジェクトであるため、他の関数の**戻り値として関数を返す**ことも可能です。これも**高階関数 (Higher-Order Function)** の一種であり、**クロージャ**を生成する一般的な方法です。

## 関数を返す関数の定義

関数を戻り値として返すには、関数宣言の戻り値の型指定部分に、返したい関数の**関数型**を指定します。

**構文:**
```go
// 関数型を直接指定
func 高階関数名(引数リスト) func(内部関数の引数リスト) 内部関数の戻り値リスト {
	// ... 処理 ...
	return func(内部関数の引数リスト) 内部関数の戻り値リスト { // 関数リテラルを返す
		// ... 内部関数の処理 ...
	}
}

// type で定義した関数型名を使用
type MyFuncType func(内部関数の引数リスト) 内部関数の戻り値リスト
func 高階関数名(引数リスト) MyFuncType {
	// ... 処理 ...
	return func(...) ... { ... } // MyFuncType に合致する関数リテラルを返す
}
```

## コード例: 乗算関数ジェネレータ

例として、指定された係数（`factor`）で数値を乗算する関数を生成する高階関数 `multiplier` を作ってみましょう。

```go title="関数を返す関数の例"
package main

import "fmt"

// int 型の引数を1つ受け取り、int 型の値を返す関数型
type IntUnaryOperator func(int) int

// multiplier 関数は、係数 factor を受け取り、
// 「int を受け取って factor 倍した int を返す関数 (IntUnaryOperator)」を返す高階関数
func multiplier(factor int) IntUnaryOperator {
	fmt.Printf("multiplier(%d) が呼び出されました。\n", factor)
	// この関数リテラルは、外側の引数 factor をキャプチャするクロージャ
	return func(n int) int {
		// キャプチャした factor を使って計算
		return n * factor
	}
}

func main() {
	// multiplier(2) を呼び出し、2倍する関数 (クロージャ) を取得
	double := multiplier(2)
	// double は func(n int) int { return n * 2 } という動作をする

	// multiplier(3) を呼び出し、3倍する関数 (クロージャ) を取得
	triple := multiplier(3)
	// triple は func(n int) int { return n * 3 } という動作をする

	// 生成された関数 (クロージャ) を使う
	fmt.Println("--- double 関数 ---")
	fmt.Printf("double(5) = %d\n", double(5)) // 5 * 2 = 10
	fmt.Printf("double(10) = %d\n", double(10)) // 10 * 2 = 20

	fmt.Println("\n--- triple 関数 ---")
	fmt.Printf("triple(5) = %d\n", triple(5)) // 5 * 3 = 15
	fmt.Printf("triple(10) = %d\n", triple(10)) // 10 * 3 = 30

	// 直接呼び出すことも可能
	fmt.Println("\n--- 直接呼び出し ---")
	fmt.Printf("multiplier(10)(5) = %d\n", multiplier(10)(5)) // 5 * 10 = 50
}

/* 実行結果:
multiplier(2) が呼び出されました。
multiplier(3) が呼び出されました。
--- double 関数 ---
double(5) = 10
double(10) = 20

--- triple 関数 ---
triple(5) = 15
triple(10) = 30

--- 直接呼び出し ---
multiplier(10) が呼び出されました。
multiplier(10)(5) = 50
*/
```

**コード解説:**

1.  `multiplier` 関数は引数 `factor` を受け取り、戻り値として `IntUnaryOperator` 型（つまり `func(int) int` 型）の関数を返します。
2.  `multiplier` 関数内部で返されているのは、`func(n int) int { return n * factor }` という関数リテラルです。
3.  この関数リテラルは、外側の `multiplier` 関数の引数である `factor` を参照しています。そのため、この関数リテラルは `factor` をキャプチャした**クロージャ**となります。
4.  `double := multiplier(2)`: `multiplier` に `2` を渡して呼び出すと、`factor` が `2` である状態をキャプチャしたクロージャ（実質的に `func(n int) int { return n * 2 }`）が返され、`double` に代入されます。
5.  `triple := multiplier(3)`: 同様に、`factor` が `3` である状態をキャプチャしたクロージャ（実質的に `func(n int) int { return n * 3 }`）が返され、`triple` に代入されます。
6.  `double(5)` や `triple(5)` のように、変数に代入されたクロージャを通常の関数のように呼び出すことができます。それぞれのクロージャは、生成時にキャプチャした `factor` の値を使って計算を行います。
7.  `multiplier(10)(5)`: `multiplier(10)` を呼び出すと10倍する関数が返され、その直後に `(5)` を付けてその返された関数を呼び出しています。

## 利点と応用

関数を戻り値として返す機能（クロージャ生成）には、以下のような利点があります。

*   **関数のカスタマイズ/生成:** `multiplier` のように、特定のパラメータ（状態）を持つ関数を動的に生成できます（関数ファクトリ）。
*   **状態の隠蔽:** クロージャがキャプチャした変数（例: `factor`）は、生成された関数の外部からは直接アクセスできません。これにより、状態を安全に管理できます。
*   **遅延実行やコールバック:** 特定のコンテキスト（状態）を持った関数を作成し、後で実行するために渡すことができます。

関数を引数として渡したり、戻り値として返したりする高階関数のテクニックは、Goで柔軟で再利用性の高いコードを書くための重要な要素です。