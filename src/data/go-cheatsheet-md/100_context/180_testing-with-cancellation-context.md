## タイトル
title: キャンセル Context を使ったテスト

## タグ
tags: ["context", "concurrency", "testing", "cancel", "WithCancel", "errors.Is", "Canceled"]

## コード
```go
package processor_test

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"myproject/processor" // テスト対象パッケージ (パスは例)
)

// テスト: 明示的にキャンセルする場合
func TestProcessDataWithContext_Cancel(t *testing.T) {
	// キャンセル可能な Context を作成
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() // テスト終了時に確実に解放

	errChan := make(chan error, 1) // 結果受け取り用チャネル

	// テスト対象関数を Goroutine で実行
	go func() {
		_, err := processor.ProcessDataWithContext(ctx, "test-cancel")
		errChan <- err
	}()

	// 少し待ってからキャンセルを実行 (処理時間より短く)
	time.Sleep(50 * time.Millisecond)
	fmt.Println("Test: cancel() 呼び出し...")
	cancel() // ★ Context をキャンセル

	// 結果を検証 (タイムアウト付きで待つのがより安全)
	select {
	case err := <-errChan:
		if err == nil { // エラーが発生することを期待
			t.Fatal("キャンセルエラーが発生しませんでした")
		}
		// ★ エラーが Canceled であることを確認 ★
		if !errors.Is(err, context.Canceled) {
			t.Errorf("期待エラーは Canceled ですが、実際は %v", err)
		} else {
			fmt.Println("Test: 期待通りキャンセルされました")
		}
	case <-time.After(1 * time.Second): // テスト自体のタイムアウト
		t.Fatal("テストがタイムアウトしました")
	}
}

// --- テスト対象の関数 (例: processor/processor.go) ---
/*
package processor
import ("context"; "time"; "fmt")
func ProcessDataWithContext(ctx context.Context, data string) (string, error) {
	select {
	case <-time.After(150 * time.Millisecond): // 150ms かかる処理
		return "processed: " + data, nil
	case <-ctx.Done(): // キャンセルチェック
		return "", ctx.Err()
	}
}
*/
```

## 解説
```text
`context.Context` を受け取る関数が、タイムアウトだけでなく
**明示的なキャンセル**にも正しく応答するかテストすることも重要です。
テストコード内で `context.WithCancel` を使い、テスト対象実行中に
`cancel()` を呼び出して挙動を確認します。

**テスト手順:**
1. **Context 生成:** `ctx, cancel := context.WithCancel(...)` で生成。
   `defer cancel()` を忘れずに。
2. **テスト対象実行とキャンセル:**
   *   テスト対象関数を Goroutine で実行し、結果をチャネルで受け取る。
   *   メイン Goroutine で少し待機 (`time.Sleep`) した後、`cancel()` を呼び出す。
     (待機時間はテスト対象の処理時間より短くする)
3. **エラー検証:**
   *   チャネルからエラーを受け取る (テスト自体のタイムアウトも考慮)。
   *   エラーが `nil` でないことを確認。
   *   エラーが `context.Canceled` であることを
       **`errors.Is(err, context.Canceled)`** で確認。

コード例の `TestProcessDataWithContext_Cancel` では、
`ProcessDataWithContext` を Goroutine で実行し、
50ms 後に `cancel()` を呼び出しています。
その後、チャネルから返されたエラーが `nil` でなく、
かつ `context.Canceled` であることを検証しています。

このように `context.WithCancel` をテストで使うことで、
明示的なキャンセル要求に対する関数の応答性を確認できます。