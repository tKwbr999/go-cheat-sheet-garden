## タイトル
title: Result 型パターン

## タグ
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "データ構造", "struct", "Result", "エラー処理", "関数型プログラミング"]

## コード
```go
package result // (パッケージ名は例)

import "fmt"

// Result[T any]: 成功時の T 型の値、またはエラーのどちらかを保持
type Result[T any] struct {
	value T
	err   error
}

// Success: 成功 Result を作成
func Success[T any](value T) Result[T] {
	return Result[T]{value: value, err: nil}
}

// Failure: 失敗 Result を作成
func Failure[T any](err error) Result[T] {
	return Result[T]{err: err} // value はゼロ値
}

// Failuref: フォーマット文字列から失敗 Result を作成
func Failuref[T any](format string, args ...any) Result[T] {
	return Result[T]{err: fmt.Errorf(format, args...)}
}

// IsOk: 成功かどうか
func (r Result[T]) IsOk() bool { return r.err == nil }

// IsErr: 失敗かどうか
func (r Result[T]) IsErr() bool { return r.err != nil }

// Value: 成功時の値 (失敗時はゼロ値)
func (r Result[T]) Value() T { return r.value }

// Error: 失敗時のエラー (成功時は nil)
func (r Result[T]) Error() error { return r.err }

// (Unwrap, UnwrapOr などのヘルパーも追加可能)
// func (r Result[T]) Unwrap() T { if r.IsErr() { panic(...) }; return r.value }
// func (r Result[T]) UnwrapOr(defaultVal T) T { if r.IsErr() { return defaultVal }; return r.value }

```

## 解説
```text
Go標準のエラー処理は複数戻り値 (`value, err`) ですが、
他の言語で見られる **Result 型** パターンもジェネリクスで実装可能です。
Result 型は、操作の**成功値 (`Ok`)** または **失敗エラー (`Err`)** の
**どちらか一方**を保持し、関数の戻り値を単一の型にまとめます。

**実装:**
*   ジェネリック構造体 `Result[T any]` を定義。
*   内部に成功時の値 `value T` と失敗時のエラー `err error` を持つ。
*   `Success(value T)`: 成功 Result (`err=nil`) を作成。
*   `Failure[T any](err error)`: 失敗 Result (`value=ゼロ値`) を作成。
    (型パラメータ `T` の指定が必要)
*   `IsOk()`, `IsErr()`, `Value()`, `Error()` 等のメソッドで
    状態確認や値/エラー取得を行う。

**使用例:**
```go
// import "myproject/result"
func parseIntResult(s string) result.Result[int] {
    val, err := strconv.Atoi(s)
    if err != nil { return result.Failure[int](err) }
    return result.Success(val)
}

res := parseIntResult("123")
if res.IsOk() {
    fmt.Println("Value:", res.Value()) // Value: 123
} else {
    fmt.Println("Error:", res.Error())
}
```

**(Unwrap 系メソッド)**
`Unwrap()` (エラーなら panic) や `UnwrapOr(default)` (エラーならデフォルト値)
のようなメソッドも定義できますが、`Unwrap()` の panic は Go の慣習から
外れるため注意が必要です。

**Go 標準パターンとの比較:**
Result 型は関数型スタイルや API 設計で役立つ場合がありますが、
Go では標準の `value, err` パターンが一般的で広く使われています。
導入は利点と可読性への影響を考慮して判断しましょう。