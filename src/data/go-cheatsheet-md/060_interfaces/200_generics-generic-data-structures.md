## タイトル
title: ジェネリックデータ構造

## タグ
tags: ["interfaces", "interface", "ジェネリクス", "generics", "型パラメータ", "型制約", "constraint", "構造体", "データ構造"]

## コード
```go
package main

import "fmt"

// ジェネリック型 Stack[T any]: 任意の型 T のスタック
type Stack[T any] struct {
	items []T
}

// Push メソッド (レシーバにも型パラメータ [T] が必要)
func (s *Stack[T]) Push(item T) {
	if s == nil { return }
	s.items = append(s.items, item)
}

// Pop メソッド
func (s *Stack[T]) Pop() (T, bool) {
	if s == nil || len(s.items) == 0 {
		var zero T // T のゼロ値を返す
		return zero, false
	}
	lastIndex := len(s.items) - 1
	item := s.items[lastIndex]
	s.items = s.items[:lastIndex]
	return item, true
}

func main() {
	// int 型のスタックをインスタンス化
	intStack := Stack[int]{}

	intStack.Push(10)
	intStack.Push(20)
	fmt.Printf("Push 後 Size: %d\n", len(intStack.items)) // (Size() メソッドは省略)

	val, ok := intStack.Pop()
	if ok { fmt.Printf("Pop: %d\n", val) } // 20
}

```

## 解説
```text
ジェネリクスは関数だけでなく、**データ構造**
(構造体やインターフェース) にも適用でき、
型安全で汎用的なコンテナ等を作成できます。

**ジェネリック型の定義:**
型名の直後に `[]` で型パラメータと制約を指定します。
```go
type 型名[型パラメータ名 型制約, ...] struct {
    フィールド名 型 // T など型パラメータを使用可
    // ...
}
// インターフェースも同様
type IfaceName[T Constraint] interface { ... }
```
コード例の `Stack[T any]` は、任意の型 `T` を
要素として持つスタックを定義しています (`any` 制約)。
内部では `T` 型のスライス `items` でデータを保持します。

**ジェネリック型へのメソッド定義:**
レシーバ型の指定にも型パラメータを含めます。
`func (変数名 型名[型パラメータ名]) メソッド名(...) ...`
例: `func (s *Stack[T]) Push(item T)`

コード例では `Stack[T]` に対して `Push` と `Pop` メソッドを
定義しています。メソッド内でも型パラメータ `T` を使えます。
`Pop` では、スタックが空の場合に返すゼロ値として `var zero T` を
使っています。

**インスタンス化と利用:**
ジェネリック型を使うには、型パラメータに具体的な型を指定して
**インスタンス化**します。
`intStack := Stack[int]{}`
これにより `intStack` は `int` 専用のスタックとなります。
同様に `Stack[string]{}` で文字列スタックも作れます。

ジェネリクスにより、`Stack` という一つの定義で、
様々な型のスタックを型安全に実現できます。
これは以前 `any` と型アサーション/型スイッチで
行っていたことの、より安全な代替手段となります。