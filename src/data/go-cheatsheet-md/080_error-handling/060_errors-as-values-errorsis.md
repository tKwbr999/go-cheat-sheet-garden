---
title: "エラー処理: エラーは値 (`errors.Is`)"
tags: ["error-handling", "error", "errors", "errors.Is", "エラーラッピング", "%w", "センチネルエラー"]
---

Go言語のエラー処理における重要な哲学は**「エラーは値である (Errors are values)」**というものです。これは、エラーが特別な制御構文（`try-catch` など）ではなく、他の値（整数、文字列、構造体など）と同じように、変数に代入したり、関数から返したり、比較したりできる**普通の「値」**として扱われることを意味します。

## エラー値の比較: `errors.Is()`

エラーが特定の種類のものであるかを確認したい場合があります。例えば、「ファイルが見つからない」という特定のエラーかどうかを判定したい場合などです。

単純な `==` 演算子でエラー値を比較することもできますが、これはエラーが**全く同じインスタンス**である場合にしか `true` になりません。`errors.New` で作成されたエラーは、たとえメッセージが同じでも異なるインスタンスになるため、`==` での比較は通常うまくいきません。

また、エラーラッピング (`%w`) が使われている場合、`==` ではラップされた根本的なエラーを判定できません。

そこで、Go 1.13 から導入されたのが **`errors.Is()`** 関数です。

**構文:** `errors.Is(err, target error) bool`

*   `err`: チェックしたいエラー（ラップされている可能性のあるエラー）。
*   `target`: 比較対象となる特定のエラー値（通常はパッケージレベルで定義された**センチネルエラー (Sentinel Error)** や、標準ライブラリで定義されているエラー値）。
*   戻り値: `err` のエラーチェーン（ラップされたエラーを遡る）の中に `target` と**同じエラー値**が見つかれば `true` を、見つからなければ `false` を返します。

**センチネルエラー:** パッケージレベルで `var ErrMyError = errors.New("my specific error")` のように定義され、特定のエラー状態を示すために使われる公開されたエラー変数。

## コード例

```go title="errors.Is によるエラー判定"
package main

import (
	"errors" // errors.Is, errors.New を使うため
	"fmt"
	"os" // os.ErrNotExist を使うため
)

// --- センチネルエラーの定義 (例) ---
var ErrItemNotFound = errors.New("アイテムが見つかりません")
var ErrPermissionDenied = errors.New("権限がありません")

// --- エラーを返す可能性のある関数 ---
func getItem(id int) (string, error) {
	if id == 1 {
		return "Apple", nil // 成功
	}
	if id == 2 {
		// ★ センチネルエラーを返す
		return "", ErrItemNotFound
	}
	if id == 3 {
		// ★ 別のセンチネルエラーを返す
		return "", ErrPermissionDenied
	}
	// その他のエラー (例: データベース接続エラーなど)
	// ここでは fmt.Errorf でラップする例
	originalErr := errors.New("データベース接続エラー")
	return "", fmt.Errorf("ID %d のアイテム取得に失敗: %w", id, originalErr)
}

func main() {
	idsToGet := []int{1, 2, 3, 4}

	for _, id := range idsToGet {
		fmt.Printf("\nアイテム %d を取得中...\n", id)
		item, err := getItem(id)

		if err != nil {
			fmt.Printf("エラー発生: %v\n", err)

			// --- errors.Is でエラーの種類を判定 ---
			if errors.Is(err, ErrItemNotFound) {
				// err が ErrItemNotFound と同じか、または ErrItemNotFound をラップしている場合
				fmt.Println("  -> アイテムが見つからないエラーです。")
			} else if errors.Is(err, ErrPermissionDenied) {
				// err が ErrPermissionDenied と同じか、またはそれをラップしている場合
				fmt.Println("  -> 権限エラーです。")
			} else {
				// 上記以外のエラー
				fmt.Println("  -> その他の種類のエラーです。")
			}

			// --- 比較: == での判定 (通常は不十分) ---
			// if err == ErrItemNotFound { ... }
			// これは err が ErrItemNotFound と全く同じインスタンスの場合しか true にならない。
			// fmt.Errorf でラップされていると false になってしまう。

		} else {
			fmt.Printf("成功: アイテム '%s' を取得しました。\n", item)
		}
	}

	// --- 標準ライブラリのエラーとの比較 ---
	// 存在しないファイルを開こうとする
	_, errOpen := os.Open("non_existent_file.txt")
	if errOpen != nil {
		fmt.Printf("\nファイルオープンエラー: %v\n", errOpen)
		// os.ErrNotExist は標準ライブラリで定義されているセンチネルエラー
		if errors.Is(errOpen, os.ErrNotExist) {
			fmt.Println("-> 原因: ファイルが存在しません。")
		}
	}
}

/* 実行結果 (環境によってエラーメッセージの細部は異なる可能性あり):
アイテム 1 を取得中...
成功: アイテム 'Apple' を取得しました。

アイテム 2 を取得中...
エラー発生: アイテムが見つかりません
  -> アイテムが見つからないエラーです。

アイテム 3 を取得中...
エラー発生: 権限がありません
  -> 権限エラーです。

アイテム 4 を取得中...
エラー発生: ID 4 のアイテム取得に失敗: データベース接続エラー
  -> その他の種類のエラーです。

ファイルオープンエラー: open non_existent_file.txt: no such file or directory
-> 原因: ファイルが存在しません。
*/
```

**コード解説:**

*   `ErrItemNotFound` と `ErrPermissionDenied` は、特定のエラー状態を表すセンチネルエラーとして定義されています。
*   `getItem` 関数は、状況に応じてこれらのセンチネルエラー、ラップされたエラー、または `nil` を返します。
*   `main` 関数内で `getItem` を呼び出した後、`errors.Is(err, ErrItemNotFound)` や `errors.Is(err, ErrPermissionDenied)` を使って、返されたエラー `err` が特定のセンチネルエラー（またはそれをラップしたもの）であるかどうかを判定しています。
*   `os.Open` が返すエラーに対しても `errors.Is(errOpen, os.ErrNotExist)` を使うことで、ファイルが存在しないという具体的な原因を特定できています。

**まとめ:**

*   エラーはGoでは単なる値です。
*   特定のエラー（特にパッケージ間で共有されるエラー状態）を表すには、センチネルエラー（`var ErrName = errors.New(...)`）を定義するのが一般的です。
*   エラーが特定のエラー値（センチネルエラーなど）であるか、またはそれをラップしているかを判定するには、`==` ではなく **`errors.Is()`** を使います。

`errors.Is` は、エラーラッピングと組み合わせることで、エラーの種類に応じた適切な処理を行うための重要なツールです。