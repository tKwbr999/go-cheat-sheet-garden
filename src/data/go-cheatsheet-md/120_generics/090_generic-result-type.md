---
title: "ジェネリクス: Result 型パターン"
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "データ構造", "struct", "Result", "エラー処理", "関数型プログラミング"]
---

Goの標準的なエラー処理は、関数が複数の戻り値（通常は結果と `error`）を返すパターンですが、他のプログラミング言語（特に Rust や関数型言語）でよく見られる **Result 型** のパターンをジェネリクスを使って実装することも可能です。

Result 型は、操作が**成功した場合の値** (`Ok` や `Success`) または**失敗した場合のエラー** (`Err` や `Failure`) の**どちらか一方**を保持する型です。これにより、関数の戻り値を単一の Result 型にまとめることができます。

## Result 型の実装

ジェネリックな構造体を使って、成功時の値の型 `T` を型パラメータとし、値 `value` とエラー `err` をフィールドとして持ちます。

```go
package result

import "fmt"

// Result[T any] は、成功時の T 型の値、またはエラーのどちらかを保持する型
type Result[T any] struct {
	value T     // 成功した場合の値 (失敗時はゼロ値)
	err   error // 失敗した場合のエラー (成功時は nil)
}

// Success は成功を表す Result を作成する
func Success[T any](value T) Result[T] {
	return Result[T]{value: value, err: nil}
}

// Failure は失敗を表す Result を作成する
func Failure[T any](err error) Result[T] {
	// 失敗時は value が T のゼロ値になる
	return Result[T]{err: err}
}

// Failuref はフォーマット文字列から失敗を表す Result を作成する
func Failuref[T any](format string, args ...any) Result[T] {
	return Result[T]{err: fmt.Errorf(format, args...)}
}

// IsOk は Result が成功を表すかどうかを返す
func (r Result[T]) IsOk() bool {
	return r.err == nil
}

// IsErr は Result が失敗を表すかどうかを返す
func (r Result[T]) IsErr() bool {
	return r.err != nil
}

// Unwrap は、成功していれば値を、失敗していれば panic する
// (注意: panic を起こすため、通常は避けるべき)
func (r Result[T]) Unwrap() T {
	if r.err != nil {
		panic(fmt.Sprintf("Result.Unwrap() called on an Err value: %v", r.err))
	}
	return r.value
}

// UnwrapOr は、成功していれば値を、失敗していればデフォルト値を返す
func (r Result[T]) UnwrapOr(defaultValue T) T {
	if r.err == nil {
		return r.value
	}
	return defaultValue
}

// Value は成功時の値を返す (失敗時はゼロ値)
// IsOk() と組み合わせて使うことを想定
func (r Result[T]) Value() T {
	return r.value
}

// Error は失敗時のエラーを返す (成功時は nil)
func (r Result[T]) Error() error {
	return r.err
}
```

*   `Result[T any]` 構造体は、値 `value` とエラー `err` を持ちます。
*   `Success(value T)` は、`value` を持ち `err` が `nil` の `Result` を作成します。
*   `Failure[T any](err error)` は、`err` を持ち `value` がゼロ値の `Result` を作成します。型パラメータ `T` を指定する必要がある点に注意してください。
*   `IsOk()`, `IsErr()`, `Unwrap()`, `UnwrapOr()`, `Value()`, `Error()` などのメソッドで、結果の状態を確認したり、値やエラーを取得したりできます。

## コード例: Result 型の使用

```go title="Result 型の使用例"
package main

import (
	"errors"
	"fmt"
	"strconv"

	"myproject/result" // 上記の result パッケージをインポート (パスは例)
)

// 文字列を Result[int] に変換する関数 (例)
func parseIntResult(s string) result.Result[int] {
	val, err := strconv.Atoi(s)
	if err != nil {
		// パース失敗時は Failure でラップして返す
		// エラーをラップすることも可能
		wrappedErr := fmt.Errorf("数値への変換失敗: %w", err)
		return result.Failure[int](wrappedErr) // 型パラメータを指定
	}
	// パース成功時は Success でラップして返す
	return result.Success(val)
}

func main() {
	res1 := parseIntResult("123")
	res2 := parseIntResult("abc")
	res3 := result.Success("OK") // Result[string]

	// --- 結果のチェックと値/エラーの取得 ---
	fmt.Println("--- 結果のチェック ---")

	// IsOk / IsErr
	fmt.Printf("res1.IsOk(): %t, res1.IsErr(): %t\n", res1.IsOk(), res1.IsErr()) // true, false
	fmt.Printf("res2.IsOk(): %t, res2.IsErr(): %t\n", res2.IsOk(), res2.IsErr()) // false, true

	// 成功時の値を取得 (IsOk と Value)
	if res1.IsOk() {
		fmt.Printf("res1 の値: %d\n", res1.Value()) // 123
	}

	// 失敗時のエラーを取得 (IsErr と Error)
	if res2.IsErr() {
		fmt.Printf("res2 のエラー: %v\n", res2.Error())
		// errors.Is などでラップされたエラーも確認できる
		var syntaxErr *strconv.NumError
		if errors.As(res2.Error(), &syntaxErr) {
			fmt.Println("-> 原因は strconv.NumError です。")
		}
	}

	// UnwrapOr でデフォルト値を取得
	fmt.Printf("res1.UnwrapOr(0): %d\n", res1.UnwrapOr(0)) // 123
	fmt.Printf("res2.UnwrapOr(0): %d\n", res2.UnwrapOr(0)) // 0 (エラーなのでデフォルト値)

	// Unwrap (失敗時は panic するので注意)
	// fmt.Printf("res2.Unwrap(): %d\n", res2.Unwrap()) // panic: Result.Unwrap() called on an Err value: ...

	fmt.Printf("res3 の値: %s\n", res3.UnwrapOr("Default")) // "OK"
}

/* 実行結果:
--- 結果のチェック ---
res1.IsOk(): true, res1.IsErr(): false
res2.IsOk(): false, res2.IsErr(): true
res1 の値: 123
res2 のエラー: 数値への変換失敗: strconv.Atoi: parsing "abc": invalid syntax
-> 原因は strconv.NumError です。
res1.UnwrapOr(0): 123
res2.UnwrapOr(0): 0
res3 の値: OK
*/
```

**コード解説:**

*   `parseIntResult` 関数は、`strconv.Atoi` の結果に応じて `result.Success(val)` または `result.Failure[int](err)` を返します。戻り値は常に `result.Result[int]` 型です。
*   `main` 関数では、`IsOk()` や `IsErr()` で結果が成功か失敗かを確認し、`Value()` や `Error()` でそれぞれの内容を取得しています。
*   `UnwrapOr()` は、エラーの場合のデフォルト値を簡単に扱う方法を提供します。
*   `Unwrap()` は便利ですが、エラー時に `panic` するため、Goの標準的なエラーハンドリングからは逸脱します。使用は慎重に行うべきです。

**Goの標準パターンとの比較:**

Goの標準的なエラー処理は、複数の戻り値 (`value, err`) を使うことです。Result 型は、以下のような場合に検討の余地があるかもしれません。

*   **関数型プログラミングスタイル:** メソッドチェーンなどで処理を繋げたい場合。
*   **API設計:** 成功か失敗かのどちらか一方の状態しか持ち得ないことを型レベルで明確にしたい場合。

しかし、多くのGoプログラマは標準の `value, err` パターンに慣れており、Result 型は Go のエコシステムではまだ一般的ではありません。導入する際は、その利点と、標準パターンから逸脱することによる可読性への影響などを考慮する必要があります。