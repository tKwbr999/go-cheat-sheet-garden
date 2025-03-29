## タイトル
title: 基本的なエラーハンドリング (`if err != nil`)

## タグ
tags: ["error-handling", "error", "if", "nil", "早期リターン"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"strconv"
)

// 文字列を整数に変換。失敗したらエラーをラップして返す。
func parseAndDescribe(s string) (string, error) {
	value, err := strconv.Atoi(s)
	if err != nil {
		// ★ エラーチェックと早期リターン
		return "", fmt.Errorf("変換失敗 '%s': %w", s, err)
	}

	// --- 正常系の処理 ---
	desc := fmt.Sprintf("数値 %d は", value)
	if value%2 == 0 { desc += "偶数" } else { desc += "奇数" }
	return desc, nil // 成功時は nil を返す
}

func main() {
	inputs := []string{"123", "abc", "-4"}
	for _, input := range inputs {
		fmt.Printf("入力 '%s':\n", input)
		desc, err := parseAndDescribe(input)

		// ★ 呼び出し側でのエラーチェック
		if err != nil {
			log.Printf("  エラー: %v\n", err)
			continue // エラーなら次の入力へ
		}

		// --- 正常系の処理 ---
		fmt.Printf("  -> 結果: %s\n", desc)
	}
}

```

## 解説
```text
Goでは、エラーを返す可能性のある関数を呼び出した後、
その戻り値のエラーを**必ずチェック**し、適切に処理します。
最も基本的なパターンが **`if err != nil`** です。

**パターン:**
1. 関数呼び出し: `result, err := functionThatMightFail()`
2. エラーチェック: 直後に `if err != nil { ... }` で確認。
3. `if` ブロック内でエラーに対応する。
   *   ログ出力: `log.Printf("エラー: %v", err)`
   *   エラーをラップして返す: `return fmt.Errorf("追加情報: %w", err)`
   *   デフォルト値設定: `result = defaultValue`
   *   リトライ (注意が必要)
   *   プログラム終了: `log.Fatalf(...)` (通常は上位でのみ)
4. 正常系処理: `if` ブロックの後、または `else` で記述。
   エラー時に早期リターン (`return`, `continue` 等) すると、
   正常系のコードのネストが浅くなり読みやすい。

コード例の `parseAndDescribe` は `strconv.Atoi` の直後に
エラーチェックし、エラーならラップして早期リターンします。
`main` 関数は `parseAndDescribe` の呼び出し後にエラーチェックし、
エラーならログ出力して `continue` します。

エラー発生可能性のある関数呼び出しの**直後**に
`if err != nil` でチェックするのがGoの基本です。