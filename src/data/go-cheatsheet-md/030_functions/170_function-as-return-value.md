## タイトル
title: 関数を戻り値として返す (高階関数, クロージャ生成)

## タグ
tags: ["functions", "func", "関数型", "戻り値", "高階関数", "クロージャ"]

## コード
```go
package main

import "fmt"

// int を受け取り int を返す関数型
type IntUnaryOperator func(int) int

// IntUnaryOperator 型の関数を返す高階関数
func multiplier(factor int) IntUnaryOperator {
	fmt.Printf("multiplier(%d) 呼び出し\n", factor)
	// factor をキャプチャしたクロージャを返す
	return func(n int) int {
		return n * factor
	}
}

func main() {
	// 2倍する関数 (クロージャ) を取得
	double := multiplier(2)

	// 生成されたクロージャを使う
	fmt.Println(double(5))  // 10
	fmt.Println(double(10)) // 20

	// 3倍する関数も同様に生成可能
	// triple := multiplier(3)
	// fmt.Println(triple(5)) // 15

	// 直接呼び出しも可能
	// fmt.Println(multiplier(10)(5)) // 50
}

```

## 解説
```text
Goでは関数を**他の関数の戻り値として返す**ことも可能です。
これも**高階関数**の一種であり、**クロージャ**を生成する
一般的な方法です。

**定義方法:**
関数宣言の戻り値の型指定部分に、返したい関数の
**関数型**を指定します。
```go
// MyFuncType 型の関数を返す例
func higherOrder() MyFuncType {
    // ...
    return func(...) ... { ... } // 関数リテラルを返す
}
```

コード例の `multiplier` 関数は、引数 `factor` を受け取り、
戻り値として `IntUnaryOperator` 型 ( `func(int) int` ) の
関数を返します。
返される関数リテラル `func(n int) int { return n * factor }` は、
外側の引数 `factor` を参照しているため、`factor` を
キャプチャした**クロージャ**となります。

`double := multiplier(2)` と呼び出すと、`factor` が `2` である
状態をキャプチャしたクロージャ (実質 `n * 2` を行う関数) が
返され、`double` に代入されます。
同様に `multiplier(3)` で3倍する関数 `triple` も生成できます。

生成されたクロージャ (`double`, `triple`) は、
通常の関数のように呼び出して使えます。
また `multiplier(10)(5)` のように、高階関数が返した関数を
その場で直接呼び出すことも可能です。

**利点:**
*   **関数のカスタマイズ/生成:** 特定のパラメータ (状態) を持つ
    関数を動的に生成できる (関数ファクトリ)。
*   **状態の隠蔽:** キャプチャした変数 (例: `factor`) は
    外部から直接アクセスできない。
*   **遅延実行/コールバック:** 特定のコンテキストを持った関数を
    作成し、後で実行するために渡せる。

高階関数はGoで柔軟で再利用性の高いコードを書くための重要要素です。