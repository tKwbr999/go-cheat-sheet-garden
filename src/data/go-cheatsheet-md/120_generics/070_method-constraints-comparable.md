---
title: "ジェネリクス: メソッドによる比較制約 (Comparable)"
tags: ["generics", "ジェネリクス", "型制約", "type constraint", "interface", "メソッドセット", "comparable", "比較"]
---

前のセクション (`030`) では、組み込みの `comparable` 制約（`==`, `!=` 演算子を保証）と `cmp.Ordered` 制約（`<`, `>`, `<=`, `>=` 演算子を保証）を見ました。

しかし、これらの演算子が定義されていない型（例えば、独自の比較ロジックを持つ構造体）に対しても、比較可能な型のみを受け入れるジェネリックな関数や型を定義したい場合があります。このような場合、**メソッドセットを持つインターフェース**を型制約として使います。

## メソッドによる比較制約の定義

比較のためのメソッド（例えば `CompareTo(other T) int`）を持つインターフェースを定義し、それを型制約として使用します。

```go
// CompareTo メソッドを持つ型のための制約インターフェース
// このインターフェースはジェネリック [T any] である必要はない場合もあるが、
// 比較対象の型を T 自身に限定したい場合はジェネリックにする。
type Comparable[T any] interface {
	// CompareTo は、レシーバが other より小さい場合に負の値、
	// 等しい場合に 0、大きい場合に正の値を返すことを期待する。
	CompareTo(other T) int
}

// ジェネリック関数: Comparable[T] 制約を持つ型 T のスライスをソートする
func SortSlice[T Comparable[T]](items []T) {
	// ... ソート処理 ...
	// items[i].CompareTo(items[j]) を使って比較できる
}
```

*   `Comparable[T any]` インターフェースは `CompareTo(other T) int` メソッドを要求します。
*   `SortSlice[T Comparable[T]]` 関数は、`Comparable[T]` 制約を満たす型 `T` のスライスを受け取ります。
*   関数内では、`T` 型の値が `CompareTo` メソッドを持つことが保証されているため、`items[i].CompareTo(items[j])` を呼び出して要素間の順序を比較できます。

## コード例: バージョン番号の比較とソート

`Major`, `Minor`, `Patch` フィールドを持つ `Version` 構造体を定義し、`CompareTo` メソッドを実装して、`Version` のスライスをソートする例です。

```go title="メソッド制約による比較とソート"
package main

import (
	"fmt"
	"sort" // sort.Slice を使う例
)

// --- 比較メソッドを持つインターフェース制約 ---
// (この例ではジェネリックにする必要はないが、比較対象を T に限定する例として)
type Comparer[T any] interface {
	// CompareTo は、レシーバが other より小さい場合に負、等しい場合に 0、大きい場合に正を返す
	CompareTo(other T) int
}

// --- ジェネリックなソート関数 ---
// T は Comparer[T] を満たす必要がある
func SortSlice[T Comparer[T]](items []T) {
	// sort.Slice を使ってソート (Go 1.8+)
	// 比較関数の中で CompareTo メソッドを呼び出す
	sort.Slice(items, func(i, j int) bool {
		// items[i] が items[j] より小さい場合に true を返す
		return items[i].CompareTo(items[j]) < 0
	})
}

// --- Comparer[Version] を実装する Version 型 ---
type Version struct {
	Major, Minor, Patch int
}

// String() メソッド (fmt.Stringer のため)
func (v Version) String() string {
	return fmt.Sprintf("v%d.%d.%d", v.Major, v.Minor, v.Patch)
}

// CompareTo メソッド (Comparer[Version] を満たす)
func (v Version) CompareTo(other Version) int {
	if v.Major != other.Major {
		return v.Major - other.Major // Major が異なればその差を返す
	}
	if v.Minor != other.Minor {
		return v.Minor - other.Minor // Minor が異なればその差を返す
	}
	return v.Patch - other.Patch // Patch の差を返す
}

func main() {
	versions := []Version{
		{1, 10, 0},
		{1, 9, 5},
		{2, 0, 0},
		{0, 9, 1},
		{1, 10, 1},
	}

	fmt.Println("ソート前:", versions)

	// ジェネリックな SortSlice 関数を呼び出す
	// T = Version (Comparer[Version] を満たす)
	SortSlice(versions)

	fmt.Println("ソート後:", versions)

	// --- 比較: 組み込みの comparable ---
	// Version 構造体はすべてのフィールドが比較可能なので、
	// 組み込みの comparable 制約も満たす。
	// しかし、comparable は == と != しか保証しないため、
	// SortSlice のような大小比較が必要な関数には使えない。
	// func CheckEquality[T comparable](a, b T) bool { return a == b }
	// fmt.Println(CheckEquality(versions[0], versions[1])) // これは可能
}

/* 実行結果:
ソート前: [v1.10.0 v1.9.5 v2.0.0 v0.9.1 v1.10.1]
ソート後: [v0.9.1 v1.9.5 v1.10.0 v1.10.1 v2.0.0]
*/
```

**コード解説:**

*   `Comparer[T any]` インターフェースは `CompareTo(other T) int` メソッドを定義します。
*   `Version` 構造体は `CompareTo(other Version) int` メソッドを実装し、`Comparer[Version]` インターフェースを満たします。比較ロジックは Major, Minor, Patch の順で行われます。
*   `SortSlice[T Comparer[T]]` 関数は、`Comparer[T]` 制約を持つ型 `T` のスライスを受け取ります。
*   `sort.Slice` の比較関数内で `items[i].CompareTo(items[j]) < 0` を呼び出すことで、`Version` 型のカスタム比較ロジックに基づいてソートが行われます。
*   `Version` 型は `comparable` でもありますが、`SortSlice` のように大小比較 (`<`) が必要な場合は `comparable` 制約だけでは不十分であり、`CompareTo` のようなメソッドを要求する制約（または `cmp.Ordered` のような制約）が必要になります。

メソッドセットを持つインターフェースを型制約として使うことで、組み込みの演算子 (`==`, `<`, `>` など) が定義されていない型に対しても、独自の比較ロジックを定義し、それを利用するジェネリックな関数（ソート、検索など）を実装することができます。