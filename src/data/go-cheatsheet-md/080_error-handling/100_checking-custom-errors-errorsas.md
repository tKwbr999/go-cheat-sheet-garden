---
title: "エラー処理: 特定の型のエラーの取得 (`errors.As`)"
tags: ["error-handling", "error", "errors", "errors.As", "エラーラッピング", "%w", "カスタムエラー", "型アサーション"]
---

`errors.Is` はエラーチェーンの中に特定のエラー**値**が含まれているかをチェックしましたが、エラーが特定の**型**であるかを確認し、その型の値としてアクセスしたい場合があります。特に、エラーがラップされている可能性がある場合に有効なのが、Go 1.13 で導入された **`errors.As()`** 関数です。

## `errors.As()` の使い方

`errors.As()` 関数は、第一引数で受け取ったエラー `err`（またはそれがラップしているエラー）の中に、第二引数で指定した**型**に代入可能なエラーがあるかどうかを探します。もし見つかれば、そのエラー値を第二引数のポインタ変数に設定し、`true` を返します。見つからなければ `false` を返します。

**構文:** `errors.As(err error, target any) bool`

*   `err`: チェックしたいエラー。
*   `target`: **ポインタ変数**へのポインタ (`any` 型として渡す)。このポインタ変数の型が、探したいエラーの型を示します（例: `*MyError` 型の変数へのポインタ）。
*   戻り値: 指定した型のエラーが見つかれば `true`、見つからなければ `false`。見つかった場合、`target` が指すポインタ変数に、そのエラー値が代入されます。

**型アサーションとの違い:**
型アサーション `v, ok := err.(*MyError)` は、`err` 自体が `*MyError` 型であるかしかチェックできません。一方、`errors.As(err, &target)` は、`err` がラップしているエラーチェーンを遡って、指定した型 (`*MyError`) に一致するエラーを探します。

## コード例

`070_defining-custom-error-types.md` で定義した `OperationError` を使ってみましょう。今回は、エラーをラップするケースも加えます。

```go title="errors.As によるカスタムエラー型のチェックと取得"
package main

import (
	"errors" // errors.As を使うため
	"fmt"
	"os" // os.Open のエラー例のため
	"time"
)

// --- カスタムエラー型 (再掲) ---
type OperationError struct {
	Timestamp time.Time
	Op        string
	Code      int
	Message   string
	Err       error // ラップされたエラー
}

func (e *OperationError) Error() string {
	errMsg := fmt.Sprintf("[%s] 操作 '%s' でエラー (コード: %d): %s",
		e.Timestamp.Format(time.RFC3339), e.Op, e.Code, e.Message)
	if e.Err != nil {
		errMsg += fmt.Sprintf(" (原因: %v)", e.Err)
	}
	return errMsg
}

// Unwrap メソッド (エラーラッピング用)
func (e *OperationError) Unwrap() error {
	return e.Err
}

// --- エラーを返す可能性のある関数 ---
// ファイルを開く処理 (os.Open のエラーをラップする可能性あり)
func openDataFile(filename string) error {
	_, err := os.Open(filename)
	if err != nil {
		// os.Open のエラー err を OperationError でラップする
		return &OperationError{
			Timestamp: time.Now(),
			Op:        "openDataFile",
			Code:      500, // 例: 内部エラーコード
			Message:   "ファイルオープン失敗",
			Err:       err, // ★ 元のエラーをラップ
		}
	}
	// 簡単のため、すぐに閉じる (実際には *os.File を返すなど)
	// file.Close()
	return nil
}

func main() {
	// --- エラーが発生するケース ---
	err := openDataFile("non_existent.txt")

	if err != nil {
		fmt.Println("エラー発生:", err)

		// --- errors.As で *OperationError 型を探す ---
		var opErr *OperationError // 対象の型 (*OperationError) のポインタ変数を宣言
		// errors.As に err と、opErr のポインタ (&opErr) を渡す
		if errors.As(err, &opErr) {
			// err のチェーン内に *OperationError が見つかった！
			// opErr 変数には、見つかった *OperationError の値が代入されている
			fmt.Println("-> これは OperationError です。")
			fmt.Printf("   操作名: %s\n", opErr.Op)
			fmt.Printf("   コード: %d\n", opErr.Code)
			fmt.Printf("   メッセージ: %s\n", opErr.Message)
			fmt.Printf("   発生時刻: %s\n", opErr.Timestamp.Format(time.Kitchen))

			// さらにラップされたエラー (opErr.Err) を調べることもできる
			if opErr.Err != nil {
				fmt.Printf("   ラップされたエラー: %v\n", opErr.Err)
				// ラップされたエラーが特定のエラー値か errors.Is で確認
				if errors.Is(opErr.Err, os.ErrNotExist) {
					fmt.Println("   -> 根本原因: ファイルが存在しません。")
				}
			}
		} else {
			fmt.Println("-> これは OperationError ではありません。")
		}

		// --- 比較: 型アサーションの場合 ---
		// 型アサーションはラップされたエラーを辿らない
		// _, ok := err.(*OperationError)
		// if ok { ... } // この場合 ok は true になる (err 自体が *OperationError なので)

		// もし err が fmt.Errorf("追加情報: %w", opErr) のようにさらにラップされていたら、
		// 型アサーションでは *OperationError を見つけられないが、errors.As なら見つけられる。

	} else {
		fmt.Println("ファイルは正常に開けました。")
	}
}

/* 実行結果 (時刻とエラーメッセージの細部は環境による):
エラー発生: [2025-03-28T17:21:00+09:00] 操作 'openDataFile' でエラー (コード: 500): ファイルオープン失敗 (原因: open non_existent.txt: no such file or directory)
-> これは OperationError です。
   操作名: openDataFile
   コード: 500
   メッセージ: ファイルオープン失敗
   発生時刻: 5:21PM
   ラップされたエラー: open non_existent.txt: no such file or directory
   -> 根本原因: ファイルが存在しません。
*/
```

**コード解説:**

*   `openDataFile` 関数は、`os.Open` がエラーを返した場合、そのエラー `err` を `OperationError` でラップして返します (`Err: err` の部分)。
*   `main` 関数で `err := openDataFile(...)` を受け取ります。この `err` は `*OperationError` 型ですが、内部に `os.Open` が返したエラーも保持しています。
*   `var opErr *OperationError`: `errors.As` で値を受け取るための、対象の型（`*OperationError`）のポインタ変数を宣言します。
*   `if errors.As(err, &opErr)`: `errors.As` を呼び出します。
    *   第一引数にチェックしたいエラー `err` を渡します。
    *   第二引数に、値を設定したいポインタ変数 `opErr` の**アドレス** (`&opErr`) を渡します。
    *   `errors.As` は `err` のエラーチェーンを遡り、`*OperationError` 型に代入可能なエラーを探します。この例では `err` 自体が `*OperationError` なので見つかります。
    *   見つかったので `errors.As` は `true` を返し、ポインタ変数 `opErr` に `err` の値（`*OperationError` のポインタ）が設定されます。
*   `if` ブロック内では、`opErr` は `*OperationError` 型の有効なポインタとして扱えるため、`opErr.Code` や `opErr.Op` などのフィールドにアクセスできます。
*   さらに `opErr.Err` でラップされた元のエラーを取得し、`errors.Is` でその原因が `os.ErrNotExist` であることも確認できています。

**まとめ:**

*   エラーが特定の**型**であるか（またはその型をラップしているか）を確認し、その型の値としてアクセスしたい場合は **`errors.As()`** を使います。
*   第二引数には、対象の型の**ポインタ変数へのポインタ**を渡します。
*   `errors.As` はエラーチェーンを辿ってくれるため、エラーラッピング (`%w`) と組み合わせて使うのに適しています。

`errors.Is` と `errors.As` は、Go 1.13 以降のエラー処理において、エラーの種類や原因を判別するための重要なツールです。