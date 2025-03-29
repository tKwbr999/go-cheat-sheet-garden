## タイトル
title: メソッドによる比較制約 (Comparable)

## タグ
tags: ["generics", "ジェネリクス", "型制約", "type constraint", "interface", "メソッドセット", "comparable", "比較"]

## コード
```go
package main

import (
	"fmt"
	"sort"
)

// 比較メソッドを持つインターフェース制約
type Comparer[T any] interface {
	// other より小さい場合に負、等しい場合に 0、大きい場合に正を返す
	CompareTo(other T) int
}

// ジェネリックソート関数 (T は Comparer[T] を満たす必要あり)
func SortSlice[T Comparer[T]](items []T) {
	sort.Slice(items, func(i, j int) bool {
		// ★ CompareTo メソッドを使って比較 ★
		return items[i].CompareTo(items[j]) < 0
	})
}

// Comparer[Version] を実装する Version 型
type Version struct { Major, Minor, Patch int }
func (v Version) String() string { /* ... */ return fmt.Sprintf("v%d.%d.%d", v.Major, v.Minor, v.Patch) }
func (v Version) CompareTo(other Version) int {
	if v.Major != other.Major { return v.Major - other.Major }
	if v.Minor != other.Minor { return v.Minor - other.Minor }
	return v.Patch - other.Patch
}

func main() {
	versions := []Version{{1, 10, 0}, {1, 9, 5}, {2, 0, 0}}
	fmt.Println("Before:", versions)
	SortSlice(versions) // T=Version (Comparer[Version] を満たす)
	fmt.Println("After:", versions) // [v1.9.5 v1.10.0 v2.0.0]
}

```

## 解説
```text
組み込みの `comparable` や `cmp.Ordered` 制約は、
`==`, `<`, `>` などの演算子が使える型に限定されます。
独自の比較ロジックを持つ構造体など、これらの演算子が
定義されていない型で比較を行いたい場合は、
**メソッドセットを持つインターフェース**を型制約として使います。

**メソッドによる比較制約:**
1. 比較メソッド (例: `CompareTo(other T) int`) を持つ
   インターフェースを定義する。
   ```go
   type Comparer[T any] interface {
       CompareTo(other T) int
   }
   ```
2. ジェネリック関数/型で、型パラメータにこのインターフェースを
   制約として指定する (`[T Comparer[T]]`)。
3. 関数内では、`T` 型の値が `CompareTo` メソッドを持つことが
   保証されるため、`a.CompareTo(b)` のように呼び出して比較できる。

コード例:
*   `Comparer[T any]` インターフェースを定義。
*   `Version` 構造体に `CompareTo(other Version) int` を実装し、
    `Comparer[Version]` を満たすようにする。
*   ジェネリック関数 `SortSlice[T Comparer[T]]` は、
    `Comparer[T]` を満たす型のスライスを受け取る。
*   `sort.Slice` の比較関数内で `items[i].CompareTo(items[j]) < 0` を
    呼び出し、`Version` のカスタム比較ロジックに基づいてソートする。

**(comparable との違い)**
`Version` は全フィールドが比較可能なので `comparable` も満たしますが、
`comparable` は `==` と `!=` しか保証しません。
`SortSlice` のように大小比較 (`<`) が必要な場合は、
`comparable` 制約だけでは不十分で、`CompareTo` のようなメソッドや
`cmp.Ordered` のような制約が必要です。

メソッドセット制約により、独自の比較ロジックを持つ型に対しても
汎用的な比較・ソート関数などをジェネリクスで実装できます。