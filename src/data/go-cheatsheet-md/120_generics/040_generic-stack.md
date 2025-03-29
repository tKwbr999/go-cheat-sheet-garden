## タイトル
title: "ジェネリクス: ジェネリックなスタック (データ構造)"

## タグ
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "データ構造", "struct", "スタック", "Stack"]

## コード
```go
package main

import "fmt"

// --- ジェネリック型の定義 ---
// Stack[T any]: 任意の型 T の値を格納できるスタック
type Stack[T any] struct {
	items []T // 内部的に T 型のスライスでデータを保持
}

// --- ジェネリック型に対するメソッド定義 ---

// Push: スタックに要素を追加する
func (s *Stack[T]) Push(item T) {
	if s == nil { return }
	s.items = append(s.items, item)
}

// Pop: スタックから要素を取り出して返す
func (s *Stack[T]) Pop() (T, bool) {
	if s == nil || len(s.items) == 0 {
		var zero T // T 型のゼロ値を返す準備
		return zero, false
	}
	lastIndex := len(s.items) - 1
	item := s.items[lastIndex]
	s.items = s.items[:lastIndex]
	return item, true
}

// IsEmpty: スタックが空かどうかを返す
func (s *Stack[T]) IsEmpty() bool {
	return s == nil || len(s.items) == 0
}

func main() {
	// --- int 型のスタック ---
	intStack := Stack[int]{}
	intStack.Push(1)
	intStack.Push(2)
	v1, ok1 := intStack.Pop() // v1=2, ok1=true
	fmt.Printf("Pop int: %v, %t\n", v1, ok1)
	v2, ok2 := intStack.Pop() // v2=1, ok2=true
	fmt.Printf("Pop int: %v, %t\n", v2, ok2)
	v3, ok3 := intStack.Pop() // v3=0, ok3=false (空)
	fmt.Printf("Pop int: %v, %t\n", v3, ok3)

	// --- string 型のスタック ---
	strStack := Stack[string]{}
	strStack.Push("A")
	strStack.Push("B")
	sv1, sok1 := strStack.Pop() // sv1="B", sok1=true
	fmt.Printf("Pop string: %v, %t\n", sv1, sok1)
}

/* 実行結果:
Pop int: 2, true
Pop int: 1, true
Pop int: 0, false
Pop string: B, true
*/
```

## 解説
```text
ジェネリクスは関数だけでなく、**データ構造**（構造体やインターフェース）にも適用できます。これにより、特定の型に依存しない、汎用的なコンテナ（リスト、スタック、キュー、マップなど）を型安全に定義できます。

ジェネリックなデータ構造の定義方法やメソッドの定義方法については、**「インターフェース」**セクションの**「ジェネリックデータ構造」** (`060_interfaces/200_generics-generic-data-structures.md`) で、スタック (Stack) を例に詳しく説明しました。

ここでは、そのジェネリックスタックのコード例を再掲します。

**ポイント（再確認）:**

*   構造体定義で `type Stack[T any] struct { ... }` のように型パラメータ `T` を宣言します。
*   フィールド `items []T` やメソッドの引数・戻り値で型パラメータ `T` を使います。
*   メソッド定義でもレシーバ型に型パラメータ `*Stack[T]` を含めます。
*   利用する際は `Stack[int]` や `Stack[string]` のように具体的な型を指定してインスタンス化します。

ジェネリクスを使うことで、様々な型に対応したデータ構造を、型ごとにコードをコピー＆ペーストすることなく、一つの定義で安全に実現できます。