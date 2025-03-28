---
title: "インターフェース: ジェネリックデータ構造"
tags: ["interfaces", "interface", "ジェネリクス", "generics", "型パラメータ", "型制約", "constraint", "構造体", "データ構造"]
---

ジェネリクスは関数だけでなく、**データ構造**（構造体やインターフェース）に対しても適用できます。これにより、特定の型に依存しない、汎用的なデータ構造（コンテナなど）を型安全に定義することができます。

## ジェネリック型の定義構文

型パラメータを持つ構造体やインターフェース（**ジェネリック型**）を定義するには、型名の直後に角括弧 `[]` で型パラメータリストと制約を指定します。

**構文:**
```go
type 型名[型パラメータ名 型制約, ...] struct {
	フィールド名1 型 // 型パラメータ T などを使用可能
	フィールド名2 型
	// ...
}

// ジェネリックインターフェースも同様
type インターフェース名[型パラメータ名 型制約, ...] interface {
	メソッド名(引数リスト) 戻り値リスト // 型パラメータ T などを使用可能
	// ...
}
```

*   `[型パラメータ名 型制約, ...]`: ジェネリック関数と同様に、型パラメータとその制約を指定します。複数の型パラメータを持つことも可能です。
*   構造体のフィールド定義や、インターフェースのメソッドシグネチャ内で、定義した型パラメータ（例: `T`）を型として使用できます。

## ジェネリック型に対するメソッド定義

ジェネリック型に対してメソッドを定義する場合も、レシーバ型の指定に型パラメータを含めます。

**構文:** `func (レシーバ名 レシーバ型[型パラメータ名]) メソッド名(...) ... { ... }`

*   レシーバ型の `型名` の後に、型定義と同じ型パラメータリスト `[型パラメータ名]` を記述します。

## コード例: 任意の型の値を格納できる `Stack`

例として、任意の型の値を格納できるスタック（後入れ先出しのデータ構造）をジェネリクスを使って実装してみましょう。

```go title="ジェネリックな Stack 型"
package main

import "fmt"

// --- ジェネリック型の定義 ---
// Stack[T any]: 任意の型 T の値を格納できるスタック
// [T any] は、型パラメータ T が任意の型 (any = interface{}) であることを示す
type Stack[T any] struct {
	items []T // 内部的に T 型のスライスでデータを保持
}

// --- ジェネリック型に対するメソッド定義 ---

// Push: スタックに要素を追加する
// レシーバは *Stack[T] (ポインタレシーバ)
func (s *Stack[T]) Push(item T) {
	if s == nil { return }
	s.items = append(s.items, item) // スライスの末尾に追加
}

// Pop: スタックから要素を取り出して返す
func (s *Stack[T]) Pop() (T, bool) {
	if s == nil || len(s.items) == 0 {
		var zero T // T 型のゼロ値を返す準備
		return zero, false // スタックが空の場合はゼロ値と false を返す
	}
	lastIndex := len(s.items) - 1
	item := s.items[lastIndex] // 最後の要素を取得
	s.items = s.items[:lastIndex] // 最後の要素をスライスから削除
	return item, true // 取り出した要素と true を返す
}

// IsEmpty: スタックが空かどうかを返す
func (s *Stack[T]) IsEmpty() bool {
	return s == nil || len(s.items) == 0
}

// Size: スタックの要素数を返す
func (s *Stack[T]) Size() int {
	if s == nil { return 0 }
	return len(s.items)
}

func main() {
	// --- ジェネリック型のインスタンス化と利用 ---

	// 1. int 型のスタックを作成
	// 型パラメータ T に具体的な型 int を指定してインスタンス化
	intStack := Stack[int]{} // または var intStack Stack[int]
	fmt.Println("--- int スタック ---")
	fmt.Printf("初期状態: IsEmpty=%t, Size=%d\n", intStack.IsEmpty(), intStack.Size())

	intStack.Push(10)
	intStack.Push(20)
	intStack.Push(30)
	fmt.Printf("Push 後: Size=%d\n", intStack.Size())

	val1, ok1 := intStack.Pop()
	if ok1 { fmt.Printf("Pop: %d\n", val1) } // 30
	val2, ok2 := intStack.Pop()
	if ok2 { fmt.Printf("Pop: %d\n", val2) } // 20
	fmt.Printf("Pop 後: IsEmpty=%t, Size=%d\n", intStack.IsEmpty(), intStack.Size())

	// 2. string 型のスタックを作成
	stringStack := Stack[string]{}
	fmt.Println("\n--- string スタック ---")
	stringStack.Push("Hello")
	stringStack.Push("World")

	val3, ok3 := stringStack.Pop()
	if ok3 { fmt.Printf("Pop: %s\n", val3) } // World
	val4, ok4 := stringStack.Pop()
	if ok4 { fmt.Printf("Pop: %s\n", val4) } // Hello
	val5, ok5 := stringStack.Pop() // 空のスタックから Pop
	if !ok5 { fmt.Println("スタックは空です。") }
}

/* 実行結果:
--- int スタック ---
初期状態: IsEmpty=true, Size=0
Push 後: Size=3
Pop: 30
Pop: 20
Pop 後: IsEmpty=false, Size=1

--- string スタック ---
Pop: World
Pop: Hello
スタックは空です。
*/
```

**コード解説:**

*   `type Stack[T any] struct { ... }`: 型パラメータ `T` を持つジェネリック構造体 `Stack` を定義しています。`any` 制約なので、`T` には任意の型を指定できます。内部では `T` 型のスライス `items` でデータを保持します。
*   `func (s *Stack[T]) Push(item T)`: `Stack[T]` に対する `Push` メソッドです。レシーバ型にも型パラメータ `[T]` を付ける必要があります。引数 `item` の型も `T` です。
*   `func (s *Stack[T]) Pop() (T, bool)`: `Pop` メソッドは `T` 型の値と `bool` を返します。スタックが空の場合に返すゼロ値を用意するために `var zero T` としています。
*   `intStack := Stack[int]{}`: `main` 関数内で、型パラメータ `T` に具体的な型 `int` を指定して `Stack` 型を**インスタンス化**しています。これにより `intStack` は `int` 専用のスタックとなります。
*   `stringStack := Stack[string]{}`: 同様に `string` を指定して `string` 専用のスタックを作成しています。
*   ジェネリック型のおかげで、`int` 用のスタックと `string` 用のスタックを、一つの `Stack[T]` 定義で型安全に実現できています。

ジェネリクスを使うことで、様々な型に対して共通のロジックを持つデータ構造や関数を、型安全性を保ったまま効率的に記述することができます。これは、以前は空インターフェース (`any`) と型アサーション/型スイッチを多用していた場面での有力な代替手段となります。