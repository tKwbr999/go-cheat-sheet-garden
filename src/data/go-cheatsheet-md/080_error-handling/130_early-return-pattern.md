---
title: "エラー処理: 早期リターンパターン (Early Return)"
tags: ["error-handling", "error", "if", "return", "早期リターン", "ガード節", "コーディングスタイル"]
---

Goのエラー処理において、コードの可読性を高めるために推奨される重要なスタイルが**早期リターン (Early Return)** パターンです。これは、エラーが発生した場合や、処理を続行するための前提条件が満たされない場合に、関数の早い段階で `return` してしまう書き方です。

このスタイルについては、**「制御構文」**セクションの**「`return` 後の `else` を避けるスタイル (早期リターン)」** (`020_flow-control/030_avoiding-else-after-return.md`) で既に説明しました。

ここでは、複数の処理ステップがあり、各ステップでエラーが発生する可能性がある場合の早期リターンパターンを再確認します。

## 早期リターンの利点（再確認）

*   **ネストの削減:** エラー処理が `if` ブロック内で完結し、すぐに `return` するため、正常系の処理が深いネストになるのを防ぎます。
*   **正常系の明確化:** 関数の主要なロジック（正常系の処理）がインデントされずに直線的に記述されるため、コードの流れが追いやすくなります。
*   **エラー処理の局所化:** エラーが発生する可能性のある処理の直後にエラーハンドリングが記述されるため、関連性が明確になります。

## コード例: 複数ステップの処理

```go title="複数ステップでの早期リターン"
package main

import (
	"errors"
	"fmt"
)

// ダミーの処理ステップ関数 (エラーを返す可能性あり)
func step1() error {
	fmt.Println("ステップ1: 実行中...")
	// return errors.New("ステップ1でエラー発生") // エラーを発生させる場合
	return nil // 成功
}

func step2(input string) error {
	fmt.Println("ステップ2: 実行中 (入力:", input, ")")
	if input == "" {
		return errors.New("ステップ2の入力が空です")
	}
	return nil // 成功
}

func step3() error {
	fmt.Println("ステップ3: 実行中...")
	return nil // 成功
}

// 複数のステップを実行する関数
func processSequence() error {
	fmt.Println("処理シーケンス開始")

	// ステップ1を実行し、エラーがあれば即座にリターン
	err := step1()
	if err != nil {
		// エラーをラップして返すのが一般的
		return fmt.Errorf("ステップ1失敗: %w", err)
	}

	// ステップ1が成功した場合のみ、ステップ2へ進む
	// (ステップ1の結果を使うなどの処理がここに入ることもある)
	intermediateResult := "step1 ok" // 例

	// ステップ2を実行し、エラーがあれば即座にリターン
	err = step2(intermediateResult)
	if err != nil {
		return fmt.Errorf("ステップ2失敗: %w", err)
	}

	// ステップ1, 2 が成功した場合のみ、ステップ3へ進む
	err = step3()
	if err != nil {
		return fmt.Errorf("ステップ3失敗: %w", err)
	}

	// すべて成功した場合
	fmt.Println("処理シーケンス正常終了")
	return nil // エラーなし
}

func main() {
	err := processSequence()
	if err != nil {
		fmt.Println("\n最終的なエラー:", err)
	} else {
		fmt.Println("\n最終結果: 成功")
	}
}

/* 実行結果 (すべてのステップが成功する場合):
処理シーケンス開始
ステップ1: 実行中...
ステップ2: 実行中 (入力: step1 ok )
ステップ3: 実行中...
処理シーケンス正常終了

最終結果: 成功
*/

/* step1() でエラーを発生させた場合の実行結果例:
処理シーケンス開始
ステップ1: 実行中...

最終的なエラー: ステップ1失敗: ステップ1でエラー発生
*/
```

**コード解説:**

*   `processSequence` 関数は、`step1`, `step2`, `step3` を順番に実行します。
*   各ステップ (`step1()`, `step2(...)`, `step3()`) の呼び出し直後に `if err != nil { return ... }` というチェックがあります。
*   もし `step1` でエラーが発生すれば、その時点でエラーがラップされて `processSequence` 関数から `return` され、`step2` や `step3` は実行されません。
*   同様に、`step1` が成功しても `step2` でエラーが発生すれば、その時点で `return` され、`step3` は実行されません。
*   すべてのステップが成功した場合にのみ、最後まで処理が進み、最後に `nil` が返されます。

このように、エラーが発生する可能性のある処理の直後に `if err != nil { return ... }` を書くことで、エラーケースを早期に処理し、正常系のコードをシンプルに保つことができます。これはGoの非常に一般的なコーディングスタイルです。