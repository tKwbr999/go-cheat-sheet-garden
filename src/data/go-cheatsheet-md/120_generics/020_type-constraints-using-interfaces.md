---
title: "ジェネリクス: インターフェースによる型制約"
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "型制約", "type constraint", "interface", "any", "Union"]
---

前のセクションで見た `any` 制約は、型パラメータ `T` が**任意の型**であることを許可しますが、これでは関数内で `T` 型の値に対して行える操作が非常に限られてしまいます（`fmt.Println` のような、`any` を受け入れる関数に渡す程度）。

多くの場合、ジェネリック関数内では、型パラメータ `T` が**特定のメソッドを持っている**ことや、**特定の演算（`+`, `<`, `>` など）が可能である**ことを期待します。このような要求を満たすために、型パラメータに**型制約 (Type Constraint)** を課します。

Goのジェネリクスでは、型制約は**インターフェース型**を使って定義します。

## 型制約としてのインターフェース

インターフェースを型制約として使う方法は主に2つあります。

1.  **メソッドセットによる制約:**
    *   従来からのインターフェースの定義方法です。インターフェースに必要なメソッドシグネチャを記述します。
    *   型パラメータにこのインターフェースを制約として指定すると、そのインターフェースが要求する**すべてのメソッドを持つ型**のみが、その型パラメータとして受け入れられます。
    *   関数内では、そのインターフェースで定義されたメソッドを呼び出すことができます。
    ```go
    // String() メソッドを持つ型のみを受け入れる制約
    type Stringer interface {
        String() string
    }
    // T は Stringer を満たす必要がある
    func PrintString[T Stringer](value T) {
        fmt.Println(value.String()) // String() メソッドを呼び出せる
    }
    ```

2.  **型リスト (Union 型要素) による制約:**
    *   Go 1.18 でインターフェースの定義が拡張され、インターフェース内に具体的な**型のリスト**を `|` で区切って列挙できるようになりました。
    *   型パラメータにこのインターフェースを制約として指定すると、リストに含まれる**いずれかの型**のみが、その型パラメータとして受け入れられます。
    *   関数内では、リストに含まれる**すべての型に共通して可能な操作**（演算子など）のみが許可されます。
    *   チルダ (`~`) を型の前につけると、その型（基底型）を持つ**独自定義型**も許可します（例: `~int` は `int` だけでなく `type MyInt int` も許可）。
    ```go
    // 整数型または浮動小数点数型のみを受け入れる制約
    type Numeric interface {
        ~int | ~int8 | ~int16 | ~int32 | ~int64 | // ~ を付けて独自定義型も許可
        ~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
        ~float32 | ~float64
    }
    // T は Numeric インターフェースにリストされた型のいずれかである必要がある
    func Sum[T Numeric](values []T) T {
        var sum T
        for _, v := range values {
            sum = sum + v // + 演算子が使える (Numeric 内の全型で可能)
        }
        return sum
    }
    ```

## コード例: 数値スライスの合計を計算する関数

型リストを使った制約の例として、整数または浮動小数点数のスライスの合計を計算するジェネリック関数 `Sum` を見てみましょう。

```go title="型リストによる制約を使った Sum 関数"
package main

import "fmt"

// --- 型制約の定義 ---
// Numeric インターフェース: 組み込みの整数型と浮動小数点数型を許可
// (Go 1.18 以降、constraints パッケージに同様の制約が定義されている場合がある -> 次のセクション)
type Numeric interface {
	// 型リスト (Union 型要素)
	int | int8 | int16 | int32 | int64 |
		uint | uint8 | uint16 | uint32 | uint64 | uintptr |
		float32 | float64
	// メソッドセットは含まない
}

// --- ジェネリック関数 Sum の定義 ---
// 型パラメータ T に Numeric 制約を課す
// これにより、T は上記のいずれかの数値型であることが保証される
func Sum[T Numeric](values []T) T {
	var sum T // T 型のゼロ値で初期化 (数値型なので 0 または 0.0)
	// スライスの各要素 v (型 T) についてループ
	for _, v := range values {
		// ★ + 演算子が使用可能 ★
		// Numeric 制約内のすべての型で + 演算子が定義されているため、
		// コンパイラはこの操作を許可する
		sum += v
	}
	// 合計値 (T 型) を返す
	return sum
}

// 独自定義型 (基底型が制約に含まれていれば使えるように ~ を使う例)
type MyInt int
type MyFloat float64

// ~ を使った制約 (Numeric とは別)
type SignedInteger interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64
}
func SumSigned[T SignedInteger](values []T) T {
	var sum T
	for _, v := range values { sum += v }
	return sum
}


func main() {
	// --- Sum 関数の呼び出し ---
	intSlice := []int{1, 2, 3, 4, 5}
	// T = int (Numeric を満たす)
	intSum := Sum(intSlice)
	fmt.Printf("Sum of %v (int): %v (型: %T)\n", intSlice, intSum, intSum)

	floatSlice := []float64{1.1, 2.2, 3.3}
	// T = float64 (Numeric を満たす)
	floatSum := Sum(floatSlice)
	fmt.Printf("Sum of %v (float64): %v (型: %T)\n", floatSlice, floatSum, floatSum)

	// string スライスは Numeric を満たさないためコンパイルエラー
	// stringSlice := []string{"a", "b", "c"}
	// stringSum := Sum(stringSlice) // コンパイルエラー！

	// --- ~ を使った制約の例 ---
	myIntSlice := []MyInt{10, 20, 30}
	// myIntSum := Sum(myIntSlice) // エラー: MyInt は Numeric に含まれていない
	myIntSumSigned := SumSigned(myIntSlice) // OK: MyInt の基底型 int は SignedInteger (~int) を満たす
	fmt.Printf("Sum of %v (MyInt): %v (型: %T)\n", myIntSlice, myIntSumSigned, myIntSumSigned)
}

/* 実行結果:
Sum of [1 2 3 4 5] (int): 15 (型: int)
Sum of [1.1 2.2 3.3] (float64): 6.6 (型: float64)
Sum of [10 20 30] (MyInt): 60 (型: main.MyInt)
*/
```

**コード解説:**

*   `type Numeric interface { int | ... | float64 }`: `Numeric` という名前のインターフェースを定義し、その中に許可する具体的な数値型を `|` で列挙しています。これが型制約となります。
*   `func Sum[T Numeric](values []T) T`: ジェネリック関数 `Sum` の型パラメータ `T` に `Numeric` 制約を指定しています。これにより、`Sum` 関数を呼び出す際には、`T` として `Numeric` インターフェースにリストされた型のいずれか（またはその基底型を持つ独自定義型、もし `~` を使っていれば）しか渡せなくなります。
*   `sum += v`: 関数内で `+` 演算子を使っています。これは、`Numeric` 制約に含まれるすべての型（`int`, `float64` など）が `+` 演算をサポートしているため、コンパイルが通ります。もし `Numeric` に `string` など `+` 演算の意味が異なる型が含まれていたら、コンパイルエラーになります。
*   `Sum([]string{...})` の呼び出しは、`string` 型が `Numeric` 制約を満たさないため、コンパイルエラーになります。
*   `SignedInteger` と `SumSigned` の例では、制約に `~int` のようにチルダ (`~`) を付けています。これにより、基底型が `int` である独自定義型 `MyInt` も `SumSigned` 関数に渡せるようになります。

型制約は、ジェネリック関数やジェネリック型が、特定のメソッドや演算を安全に使用できるようにするための重要な仕組みです。インターフェースを使って、必要なメソッドセットや許可する型のリストを定義することで、型パラメータに適切な制限をかけることができます。