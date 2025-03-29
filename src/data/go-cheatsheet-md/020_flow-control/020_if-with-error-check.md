## タイトル
title: 制御構文: `if` 文を使ったエラーチェック

## タグ
tags: ["flow-control", "if", "エラー処理", "error", "nil"]

## コード
```go
package main

import (
	"fmt"
	"strconv"
)

// エラーを返す可能性のある関数 (例)
func processData(input string) (string, error) {
	val, err := strconv.Atoi(input)
	if err != nil {
		return "", fmt.Errorf("変換失敗: %w", err) // エラー時は nil 以外を返す
	}
	return fmt.Sprintf("結果: %d", val*2), nil // 成功時は nil を返す
}

func main() {
	input := "123" // または "abc" などエラーになる入力

	// if の初期化ステートメントで関数を呼び出し、エラーをチェック
	if result, err := processData(input); err != nil {
		// エラー処理 (err はこの if ブロック内でのみ有効)
		fmt.Printf("'%s' の処理エラー: %v\n", input, err)
	} else {
		// 正常処理 (result と err はこの else ブロック内でのみ有効)
		fmt.Printf("'%s' の処理成功: %s\n", input, result)
	}
	// fmt.Println(err) // エラー: err は if の外では未定義
}

```

## 解説
```text
Goでは、エラーが発生する可能性のある関数は、
戻り値の一つとして `error` 型を返すのが一般的です。
エラーがなければ `nil` を、あればエラー情報を返します。

呼び出し元は、戻り値の `error` が `nil` かどうかを
チェックし、適切に処理する必要があります。

**`if err := ...; err != nil` パターン:**
`if` 文の初期化ステートメントを使うと、
エラーを返す関数呼び出しとそのエラーチェックを
簡潔に書けます。これはGoで非常に一般的なイディオムです。

**コード例:**
`if result, err := processData(input); err != nil { ... }`
1.  `processData(input)` を呼び出し、結果を `result` に、
    エラーを `err` に代入します (初期化ステートメント)。
2.  直後に `err != nil` でエラーが発生したかを
    チェックします (条件式)。
3.  エラーがあれば (`true` なら) `if` ブロックを実行。
4.  エラーがなければ (`false` なら) `else` ブロックを実行。

**利点:**
*   **エラー処理の局所化:** エラー発生源の直後に
    ハンドリングを書け、コードが追いやすくなります。
*   **スコープ限定:** エラー変数 (`err`) や正常時の結果変数
    (`result`) のスコープが `if-else` ブロック内に
    限定され、意図しない場所での使用を防ぎます。
*   **簡潔な記述:** 関数呼び出しとエラーチェックを
    一行で書けます。

このパターンはGoのコードで頻繁に使われる
基本的なエラー処理方法です。