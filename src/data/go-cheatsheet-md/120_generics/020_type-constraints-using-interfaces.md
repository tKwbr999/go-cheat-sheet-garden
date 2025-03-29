## タイトル
title: ジェネリクス: インターフェースによる型制約

## タグ
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "型制約", "type constraint", "interface", "any", "Union"]

## コード
```go
package main

import "fmt"

// 型制約: 組み込みの数値型を許可するインターフェース
type Numeric interface {
	int | int8 | int16 | int32 | int64 |
		uint | uint8 | uint16 | uint32 | uint64 | uintptr |
		float32 | float64
	// (Go 1.18+ constraints パッケージに同様の定義あり)
}

// ジェネリック関数 Sum: T は Numeric 制約を満たす必要がある
func Sum[T Numeric](values []T) T {
	var sum T
	for _, v := range values {
		sum += v // + 演算子が使える (Numeric 内の型は全てサポート)
	}
	return sum
}

func main() {
	intSlice := []int{1, 2, 3}
	intSum := Sum(intSlice) // T=int
	fmt.Printf("Sum(%v): %v (%T)\n", intSlice, intSum, intSum)

	floatSlice := []float64{1.1, 2.2}
	floatSum := Sum(floatSlice) // T=float64
	fmt.Printf("Sum(%v): %v (%T)\n", floatSlice, floatSum, floatSum)

	// stringSlice := []string{"a"}
	// Sum(stringSlice) // コンパイルエラー (string は Numeric ではない)
}

```

## 解説
```text
型パラメータに `any` を使うと任意の型を受け入れられますが、
関数内でその型の値に対して行える操作が限られます。
特定のメソッドや演算を可能にするには**型制約**を課します。
Goでは型制約は**インターフェース型**で定義します。

**型制約としてのインターフェース:**
1.  **メソッドセットによる制約:**
    従来通りインターフェースに必要なメソッドを定義。
    型パラメータに指定すると、そのメソッドを持つ型のみ受け入れ可能。
    関数内ではそのメソッドを呼び出せる。
    ```go
    type Stringer interface { String() string }
    func Print[T Stringer](v T) { fmt.Println(v.String()) }
    ```
2.  **型リスト (Union 型要素) による制約 (Go 1.18+):**
    インターフェース内に `|` で区切って許可する**型**を列挙。
    型パラメータに指定すると、リスト内の型のみ受け入れ可能。
    関数内ではリスト内の**全型に共通する操作** (演算子等) が可能。
    チルダ `~` を付けると基底型が一致する独自定義型も許可 (例: `~int`)。

コード例の `Numeric` インターフェースは、型リストを使って
組み込みの数値型を列挙しています。
`Sum[T Numeric]` 関数は、`T` が `Numeric` に含まれる型である
ことを要求します。これにより、関数内で `+` 演算子を安全に使えます。
`int` や `float64` のスライスは渡せますが、`string` スライスは
`Numeric` 制約を満たさないためコンパイルエラーになります。

**(補足)** Go 1.18 以降、標準ライブラリの `constraints` パッケージに
`constraints.Integer`, `constraints.Float`, `constraints.Ordered` など、
よく使われる型制約が定義されています。

型制約は、ジェネリックコードの型安全性を高め、
利用可能な操作を明確にするための重要な仕組みです。