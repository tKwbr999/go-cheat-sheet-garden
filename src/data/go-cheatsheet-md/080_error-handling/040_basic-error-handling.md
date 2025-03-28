---
title: "エラー処理: 基本的なエラーハンドリング (`if err != nil`)"
tags: ["error-handling", "error", "if", "nil", "早期リターン"]
---

Go言語では、エラーが発生する可能性のある関数は `error` 型の値を返すのが一般的です。関数を呼び出す側は、その戻り値のエラーを**必ずチェック**し、適切に処理する必要があります。そのための最も基本的なパターンが `if err != nil` です。

## `if err != nil` パターン

1.  エラーを返す可能性のある関数を呼び出し、戻り値（結果とエラー）を受け取ります。
    ```go
    result, err := functionThatMightFail()
    ```
2.  直後に `if` 文を使って、返された `err` が `nil` でない（つまりエラーが発生した）かどうかをチェックします。
    ```go
    if err != nil {
        // エラーが発生した場合の処理をここに書く
    }
    ```
3.  エラーが発生した場合の処理を行います。一般的な処理には以下のようなものがあります。
    *   **エラーをログに出力する:** `log.Printf("エラー: %v", err)`
    *   **エラーをラップして呼び出し元に返す:** `return fmt.Errorf("追加情報: %w", err)` （早期リターン）
    *   **デフォルト値を設定して処理を続ける:** `result = defaultValue`
    *   **リトライする:** （ただし無限ループに注意）
    *   **プログラムを終了する:** `log.Fatalf("致命的なエラー: %v", err)` （通常は `main` 関数など、上位レベルでのみ行う）
4.  `if err != nil` ブロックの後（または `else` ブロック）には、エラーが発生しなかった場合の**正常系の処理**を記述します。早期リターンを使うことで、正常系のコードのネストを浅く保つことができます。

## コード例

```go title="基本的なエラーハンドリングの例"
package main

import (
	"errors"
	"fmt"
	"log" // ログ出力用
	"strconv"
)

// 文字列を整数に変換し、結果を説明付きで返す関数
func parseAndDescribe(s string) (string, error) {
	// strconv.Atoi はエラーを返す可能性がある
	value, err := strconv.Atoi(s)
	if err != nil {
		// ★ エラーが発生した場合の処理 ★
		// エラーをラップして、追加情報と共に呼び出し元に返す (早期リターン)
		return "", fmt.Errorf("文字列 '%s' の整数変換に失敗: %w", s, err)
	}

	// --- ここから下は err == nil が保証されている (正常系) ---
	description := fmt.Sprintf("数値 %d は", value)
	if value%2 == 0 {
		description += "偶数です。"
	} else {
		description += "奇数です。"
	}
	return description, nil // 成功時は結果と nil を返す
}

func main() {
	inputs := []string{"123", "abc", "-4", "0"}

	for _, input := range inputs {
		fmt.Printf("入力 '%s' を処理中...\n", input)
		desc, err := parseAndDescribe(input)

		// ★ エラーチェック ★
		if err != nil {
			// エラーが発生した場合、ログに出力して次のループへ
			log.Printf("エラー: %v", err)
			continue // 次の入力へ
		}

		// --- 正常系の処理 ---
		fmt.Printf("  -> 結果: %s\n", desc)
	}

	fmt.Println("\nすべての処理が完了しました。")
}

/* 実行結果 (ログのプレフィックスは環境による):
入力 '123' を処理中...
  -> 結果: 数値 123 は奇数です。
入力 'abc' を処理中...
2025/03/28 17:15:00 エラー: 文字列 'abc' の整数変換に失敗: strconv.Atoi: parsing "abc": invalid syntax
入力 '-4' を処理中...
  -> 結果: 数値 -4 は偶数です。
入力 '0' を処理中...
  -> 結果: 数値 0 は偶数です。

すべての処理が完了しました。
*/
```

**コード解説:**

*   `parseAndDescribe` 関数は、`strconv.Atoi` を呼び出した直後に `if err != nil` でエラーをチェックしています。エラーがあれば、`fmt.Errorf` でエラーをラップして `return` しています（早期リターン）。エラーがなければ、その後の正常系の処理に進みます。
*   `main` 関数では、`parseAndDescribe` を呼び出した後、同様に `if err != nil` でエラーをチェックしています。
    *   エラーがある場合 (`err != nil`) は、`log.Printf` でエラーメッセージを出力し、`continue` で `for` ループの次の反復に進みます。
    *   エラーがない場合 (`else` 節は省略されている）、正常系の処理として結果 `desc` を表示します。

**ポイント:**

*   エラーが発生する可能性のある関数呼び出しの**直後**に `if err != nil` でチェックを行うのが基本です。
*   エラーが発生した場合、その場で処理を中断（`return`, `continue`, `break` など）するか、あるいはエラーを適切に処理して続行するかを明確に判断します。
*   早期リターンを使うことで、正常系のコードがインデントの深い場所に来るのを避け、読みやすくすることができます。

この `if err != nil` パターンは、Goのコード全体で繰り返し現れる、最も基本的で重要なエラー処理の方法です。