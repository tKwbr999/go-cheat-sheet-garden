## タイトル
title: 特定の型のエラーの取得 (`errors.As`)

## タグ
tags: ["error-handling", "error", "errors", "errors.As", "エラーラッピング", "%w", "カスタムエラー", "型アサーション"]

## コード
```go
package main

import (
	"errors"
	"fmt"
	"os"
	"time"
)

// カスタムエラー型
type OperationError struct {
	Timestamp time.Time; Op string; Code int; Message string; Err error
}
func (e *OperationError) Error() string { /* ... 実装 ... */
	msg := fmt.Sprintf("[%s] Op:%s Code:%d Msg:%s",
		e.Timestamp.Format(time.RFC3339), e.Op, e.Code, e.Message)
	if e.Err != nil { msg += fmt.Sprintf(" (Cause: %v)", e.Err) }
	return msg
}
// エラーラッピングのために Unwrap を実装
func (e *OperationError) Unwrap() error { return e.Err }

// エラーをラップして返す関数
func openFileWrapped(filename string) error {
	_, err := os.Open(filename)
	if err != nil {
		// os.Open のエラー err を OperationError でラップ
		return &OperationError{ time.Now(), "open", 500, "失敗", err }
	}
	return nil
}

func main() {
	err := openFileWrapped("non_existent.txt")
	if err != nil {
		fmt.Println("エラー:", err)

		// errors.As で *OperationError 型を探す
		var opErr *OperationError // 対象の型のポインタ変数を用意
		// 第2引数に opErr のアドレス (&opErr) を渡す
		if errors.As(err, &opErr) {
			// 見つかった場合、opErr に値が設定される
			fmt.Println("-> OperationError です")
			fmt.Printf("   コード: %d\n", opErr.Code) // フィールドにアクセス
			if opErr.Err != nil {
				fmt.Printf("   ラップされたエラー: %v\n", opErr.Err)
				// if errors.Is(opErr.Err, os.ErrNotExist) { ... }
			}
		} else {
			fmt.Println("-> OperationError ではありません")
		}
	}
}
```

## 解説
```text
エラーチェーン（`%w` でラップされたエラーの連なり）の中に
特定の**型**のエラーが含まれているかを確認し、
その型の値としてアクセスしたい場合は、Go 1.13 で導入された
**`errors.As()`** 関数を使います。
`import "errors"` で利用します。

**構文:** `errors.As(err error, target any) bool`
*   `err`: チェックしたいエラー。
*   `target`: **ポインタ変数へのポインタ** (`any` 型)。
    このポインタ変数の型が探したいエラーの型を示す
    (例: `var myErr *MyError; errors.As(err, &myErr)`)。
*   戻り値 (`bool`): `err` のエラーチェーン内に `target` の型に
    代入可能なエラーが見つかれば `true`。
    見つかった場合、`target` が指すポインタ変数にそのエラー値が代入される。

**型アサーションとの違い:**
型アサーション `v, ok := err.(*MyError)` は `err` 自体の型しか
見ませんが、`errors.As` はエラーチェーンを**遡って**指定された
型を探します。エラーラッピング (`%w`) と組み合わせて使うのに適しています。

コード例では、`openFileWrapped` が返すラップされたエラー `err` に対し、
`errors.As(err, &opErr)` を使っています。
`err` は `*OperationError` なので `errors.As` は `true` を返し、
`opErr` 変数に `err` の値 (`*OperationError` のポインタ) が設定されます。
これにより `if` ブロック内で `opErr.Code` などにアクセスできます。
さらに `opErr.Err` でラップされた元の `os.Open` のエラーにもアクセスできます。

**`Unwrap()` メソッド:**
`errors.As` (や `errors.Is`) がエラーチェーンを辿るためには、
エラーをラップしている型 (例: `OperationError`) が
`Unwrap() error` メソッドを実装している必要があります。
このメソッドはラップしている内部エラーを返すように実装します。

`errors.As` は、ラップされた可能性のあるエラーから特定の型の
エラー情報を取り出すための重要な関数です。