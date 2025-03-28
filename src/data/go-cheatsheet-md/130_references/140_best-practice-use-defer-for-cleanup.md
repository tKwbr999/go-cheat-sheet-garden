---
title: "ベストプラクティス: クリーンアップに `defer` を使う"
tags: ["references", "best practice", "defer", "cleanup", "Close", "Unlock", "リソース管理"]
---

ファイルハンドル、ネットワーク接続、ミューテックスロックなど、使用後に**解放 (クリーンアップ)** する必要があるリソースを扱う場合、Goでは **`defer`** 文を使うのが最も一般的で推奨される方法です。

`defer` の基本的な使い方やクリーンアップへの応用については、**「制御構文」**セクションの**「`defer` によるクリーンアップ処理」** (`020_flow-control/160_defer-for-cleanup.md`) で既に説明しました。

## なぜ `defer` が重要か？ (再確認)

*   **確実な実行:** `defer` で登録された関数呼び出しは、`defer` を含む関数が**どのように終了しても**（正常な `return`、エラーによる早期リターン、あるいは `panic`）、その**終了直前に必ず実行**されます。
*   **リソースリークの防止:** ファイルの `Close()` やミューテックスの `Unlock()` などを `defer` で登録することで、これらの解放処理を**呼び忘れる**というミスを防ぎ、リソースリークを効果的に防止できます。
*   **コードの局所性:** リソースを取得するコードの**直後**に、そのリソースを解放する `defer` 文を書くことで、取得と解放の処理がコード上で近くにまとまり、可読性が向上します。

## 基本パターン（再確認）

```go title="defer によるリソースクリーンアップの基本"
package main

import (
	"fmt"
	"log"
	"os"
	"sync"
)

// ファイル処理の例
func processFile(filename string) error {
	fmt.Printf("\nファイル '%s' を処理中...\n", filename)
	f, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("オープン失敗: %w", err)
	}
	// ★ ファイルを開いた直後に Close を defer で登録 ★
	defer func() {
		fmt.Printf("defer: '%s' をクローズします。\n", filename)
		if err := f.Close(); err != nil {
			// Close のエラーも考慮する (080_error-handling/180 参照)
			log.Printf("警告: ファイルクローズ失敗: %v", err)
		}
	}()

	// ... ファイル f を使った処理 ...
	fmt.Println("ファイルを読み込み中...")
	// 例: 途中でエラーが発生して return する場合でも defer は実行される
	// if someCondition {
	// 	return errors.New("処理中にエラー発生")
	// }

	fmt.Println("ファイル処理完了。")
	return nil // 正常終了時も defer は実行される
}

// Mutex の例
var mu sync.Mutex
var counter int

func incrementCounter() {
	mu.Lock() // ロックを取得
	// ★ ロック取得直後に Unlock を defer で登録 ★
	defer func() {
		fmt.Println("defer: アンロックします。")
		mu.Unlock()
	}()

	fmt.Println("カウンターをインクリメントします...")
	counter++
	// 例: ここで panic が発生しても defer は実行される
	// if counter == 1 { panic("意図的なパニック") }
}

func main() {
	// ファイル処理の呼び出し
	os.WriteFile("temp.txt", []byte("data"), 0644)
	processFile("temp.txt")
	os.Remove("temp.txt")

	fmt.Println("---")

	// Mutex 処理の呼び出し
	incrementCounter()
	fmt.Printf("現在のカウンター: %d\n", counter)
}

/* 実行結果:
ファイル 'temp.txt' を処理中...
ファイルを読み込み中...
ファイル処理完了。
defer: 'temp.txt' をクローズします。
---
カウンターをインクリメントします...
defer: アンロックします。
現在のカウンター: 1
*/
```

リソース（ファイル、ネットワーク接続、ロック、メモリなど）を取得したら、その直後に `defer` を使って解放処理を登録する、というパターンは、Goのコードを安全かつ堅牢にするための基本的なテクニックです。