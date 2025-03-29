## タイトル
title: エラー処理: 早期リターンパターン (Early Return)

## タグ
tags: ["error-handling", "error", "if", "return", "早期リターン", "ガード節", "コーディングスタイル"]

## コード
```go
package main

import (
	"errors"
	"fmt"
)

// ダミーの処理ステップ関数 (エラーを返す可能性あり)
func step1() error { fmt.Println("Step 1"); return nil }
func step2(s string) error { fmt.Println("Step 2", s); if s == "" { return errors.New("step 2 error") }; return nil }
func step3() error { fmt.Println("Step 3"); return nil }


// 複数のステップを実行し、エラーがあれば早期リターン
func processSequence() error {
	fmt.Println("Process Start")

	err := step1()
	if err != nil {
		return fmt.Errorf("step 1 failed: %w", err) // 早期リターン
	}

	intermediate := "step1 ok" // step1 の結果を使う例

	err = step2(intermediate)
	if err != nil {
		return fmt.Errorf("step 2 failed: %w", err) // 早期リターン
	}

	err = step3()
	if err != nil {
		return fmt.Errorf("step 3 failed: %w", err) // 早期リターン
	}

	fmt.Println("Process Success")
	return nil // すべて成功
}

func main() {
	err := processSequence()
	if err != nil {
		fmt.Println("\n最終エラー:", err)
	} else {
		fmt.Println("\n最終結果: 成功")
	}
}

```

## 解説
```text
Goのエラー処理で推奨されるスタイルが
**早期リターン (Early Return)** パターンです。
エラー発生時や前提条件を満たさない場合に、
関数の早い段階で `return` します。

**利点:**
*   **ネスト削減:** エラー処理が `if` 内で完結し `return` するため、
    正常系の処理のネストが深くならない。
*   **正常系の明確化:** 関数の主要ロジック（正常系）が
    インデントされず直線的に記述され、追いやすい。
*   **エラー処理の局所化:** エラー発生可能性のある処理の直後に
    ハンドリングが書かれ、関連性が明確。

コード例の `processSequence` 関数では、`step1`, `step2`, `step3` の
各呼び出し直後に `if err != nil { return ... }` があります。
もし `step1` でエラーが発生すれば、その場で `return` され、
`step2`, `step3` は実行されません。
同様に `step2` でエラーが発生すれば `step3` は実行されません。
すべてのステップが成功した場合のみ、最後まで処理が進みます。

エラー発生可能性のある処理の直後に `if err != nil { return ... }` を
書くことで、エラーケースを早期に処理し、正常系のコードを
シンプルに保てます。これはGoの非常に一般的なスタイルです。
(ガード節 (Guard Clause) とも呼ばれる考え方)