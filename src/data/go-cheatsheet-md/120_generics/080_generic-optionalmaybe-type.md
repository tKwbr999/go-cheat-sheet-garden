---
title: "ジェネリクス: Optional/Maybe 型パターン"
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "データ構造", "struct", "Optional", "Maybe", "nil", "ゼロ値"]
---

関数が値を返す際に、その値が**存在する場合**と**存在しない場合**があることを明確に示したい場合があります。例えば、マップからキーで値を検索する場合、キーが存在すれば値が返りますが、存在しなければ何も返せません。

Goでは、このような場合に複数の戻り値（例: `value, ok := m[key]`）を使うのが一般的ですが、他の言語でよく見られる **Optional** や **Maybe** と呼ばれるパターンをジェネリクスを使って実装することもできます。これは、値が存在するかどうかという状態と値自体を一つの型でカプセル化する方法です。

## Optional 型の実装

ジェネリックな構造体を使って、任意の型 `T` の値とその値が有効かどうかを示すフラグを保持します。

```go
package optional

// Optional[T any] は、T 型の値が存在するかもしれないことを示す型
type Optional[T any] struct {
	value T    // 値 (存在しない場合はゼロ値)
	valid bool // 値が有効かどうか (存在するかどうか)
}

// Some は値が存在する Optional を作成する
func Some[T any](value T) Optional[T] {
	return Optional[T]{value: value, valid: true}
}

// None は値が存在しない Optional を作成する
func None[T any]() Optional[T] {
	// value は T のゼロ値になる
	return Optional[T]{valid: false}
}

// IsPresent は値が存在するかどうかを返す
func (o Optional[T]) IsPresent() bool {
	return o.valid
}

// IsEmpty は値が存在しないかどうかを返す
func (o Optional[T]) IsEmpty() bool {
	return !o.valid
}

// Get は値と、値が存在するかどうかを示す bool 値を返す
// (マップのカンマOKイディオムに似ている)
func (o Optional[T]) Get() (T, bool) {
	return o.value, o.valid
}

// OrElse は、値が存在すればその値を、存在しなければデフォルト値を返す
func (o Optional[T]) OrElse(defaultValue T) T {
	if o.valid {
		return o.value
	}
	return defaultValue
}
```

*   `Optional[T any]` 構造体は、値 `value` (型 `T`) と、それが有効かを示す `valid` (型 `bool`) を持ちます。
*   `Some(value T)` は、値を持つ `Optional` を作成します (`valid = true`)。
*   `None[T any]()` は、値を持たない `Optional` を作成します (`valid = false`)。型パラメータ `T` を指定する必要がある点に注意してください。
*   `IsPresent()`, `IsEmpty()`, `Get()`, `OrElse()` などのメソッドで、値の存在を確認したり、安全に値を取得したりできます。

## コード例: Optional 型の使用

```go title="Optional 型の使用例"
package main

import (
	"fmt"
	"strconv" // strconv.Atoi の例のため

	"myproject/optional" // 上記の optional パッケージをインポート (パスは例)
)

// 文字列を Optional[int] に変換する関数 (例)
func parseIntOptional(s string) optional.Optional[int] {
	val, err := strconv.Atoi(s)
	if err != nil {
		// パース失敗時は None を返す
		return optional.None[int]() // 型パラメータを指定
	}
	// パース成功時は Some でラップして返す
	return optional.Some(val)
}

func main() {
	// --- Optional の生成 ---
	opt1 := optional.Some(123)       // 値 123 を持つ Optional[int]
	opt2 := optional.None[int]()      // 値を持たない Optional[int]
	opt3 := optional.Some("hello")    // 値 "hello" を持つ Optional[string]
	opt4 := parseIntOptional("456")   // Some(456) が返るはず
	opt5 := parseIntOptional("abc")   // None[int]() が返るはず

	// --- 値の存在チェックと取得 ---
	fmt.Println("--- 値のチェックと取得 ---")

	// IsPresent / IsEmpty
	fmt.Printf("opt1.IsPresent(): %t, opt1.IsEmpty(): %t\n", opt1.IsPresent(), opt1.IsEmpty()) // true, false
	fmt.Printf("opt2.IsPresent(): %t, opt2.IsEmpty(): %t\n", opt2.IsPresent(), opt2.IsEmpty()) // false, true

	// Get メソッド (カンマOKイディオム)
	if val, ok := opt1.Get(); ok {
		fmt.Printf("opt1 の値: %d\n", val) // 123
	} else {
		fmt.Println("opt1 には値がありません。")
	}

	if val, ok := opt2.Get(); ok {
		fmt.Printf("opt2 の値: %d\n", val)
	} else {
		fmt.Println("opt2 には値がありません。") // こちらが実行される
	}

	// OrElse メソッド
	fmt.Printf("opt1.OrElse(0): %d\n", opt1.OrElse(0)) // 123 (値が存在するので value が返る)
	fmt.Printf("opt2.OrElse(0): %d\n", opt2.OrElse(0)) // 0   (値が存在しないので defaultValue が返る)
	fmt.Printf("opt3.OrElse(\"default\"): %s\n", opt3.OrElse("default")) // "hello"

	// --- parseIntOptional の結果 ---
	fmt.Println("\n--- parseIntOptional の結果 ---")
	if val, ok := opt4.Get(); ok {
		fmt.Printf("opt4 ('456') のパース結果: %d\n", val) // 456
	}
	if _, ok := opt5.Get(); !ok {
		fmt.Println("opt5 ('abc') のパース失敗 (値なし)") // こちらが実行される
	}
}

/* 実行結果:
--- 値のチェックと取得 ---
opt1.IsPresent(): true, opt1.IsEmpty(): false
opt2.IsPresent(): false, opt2.IsEmpty(): true
opt1 の値: 123
opt2 には値がありません。
opt1.OrElse(0): 123
opt2.OrElse(0): 0
opt3.OrElse("default"): hello

--- parseIntOptional の結果 ---
opt4 ('456') のパース結果: 456
opt5 ('abc') のパース失敗 (値なし)
*/
```

**コード解説:**

*   `parseIntOptional` 関数は、`strconv.Atoi` が成功すれば `optional.Some(val)` を、失敗すれば `optional.None[int]()` を返します。これにより、関数の戻り値だけでパースの成否と結果（成功した場合）を表現できます。
*   `main` 関数では、`IsPresent`, `Get`, `OrElse` メソッドを使って `Optional` 型の値を安全に扱っています。
*   `Get` メソッドは、マップのカンマOKイディオムと同様に、値が存在するかどうかを `bool` 値で返すため、安全に値を取り出すことができます。
*   `OrElse` は、値が存在しない場合に備えてデフォルト値を提供したい場合に便利です。

ジェネリックな Optional 型は、関数の戻り値として「値が存在しない」状態を `nil` やゼロ値と明確に区別して表現したい場合や、メソッドチェーンなどで連続的な処理を記述したい場合に役立つことがあります。ただし、Goの標準的なエラー処理（`error` を返す）やカンマOKイディオムで十分な場合も多いので、状況に応じて使い分けることが重要です。