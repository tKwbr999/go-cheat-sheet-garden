---
title: "Context パッケージ: キャンセル Context を使ったテスト"
tags: ["context", "concurrency", "testing", "cancel", "WithCancel", "errors.Is", "Canceled"]
---

`context.Context` を受け取る関数が、タイムアウトだけでなく、**明示的なキャンセル**にも正しく応答するかどうかをテストすることも重要です。テストコード内で `context.WithCancel` を使い、テスト対象の関数を実行している間に `cancel()` 関数を呼び出すことで、キャンセル時の挙動を確認できます。

## テストの手順

1.  **キャンセル可能な Context を生成:** `context.WithCancel(context.Background())` を使って、テスト用の Context `ctx` と `cancel` 関数を生成します。`defer cancel()` を忘れないようにします。
2.  **テスト対象関数を Goroutine で実行 (または非同期的にキャンセル):**
    *   テスト対象の関数が完了する前に `cancel()` を呼び出す必要があります。一つの方法は、テスト対象関数を別の Goroutine で実行し、メインのテスト Goroutine で少し待ってから `cancel()` を呼び出すことです。
    *   あるいは、テスト対象関数をメインのテスト Goroutine で実行し、別の Goroutine を起動して少し待ってから `cancel()` を呼び出す方法もあります（こちらの例を以下に示します）。
3.  **エラーを検証:** テスト対象の関数がエラーを返すことを期待します。その返されたエラー `err` に対して `errors.Is(err, context.Canceled)` を呼び出し、`true` が返ることを確認します。これにより、関数が明示的なキャンセルによって正しく中断されたことを検証できます。

## コード例

前のセクションと同じ `ProcessDataWithContext` 関数をテストします。

**テスト対象のコード (`processor.go` - 例):** (再掲)
```go
package processor

import (
	"context"
	"fmt"
	"time"
)

// 時間のかかる処理を行う関数
func ProcessDataWithContext(ctx context.Context, data string) (string, error) {
	fmt.Printf("  (ProcessData: '%s' の処理開始)\n", data)
	processingTime := 150 * time.Millisecond

	select {
	case <-time.After(processingTime):
		result := fmt.Sprintf("processed: %s", data)
		fmt.Printf("  (ProcessData: '%s' の処理完了)\n", data)
		return result, nil
	case <-ctx.Done(): // ★ Context のキャンセルをチェック
		err := ctx.Err()
		fmt.Printf("  (ProcessData: '%s' の処理キャンセル: %v)\n", data, err)
		return "", err // キャンセル理由を返す
	}
}
```

**テストコード (`processor_test.go` - 例):**
```go
package processor_test

import (
	"context"
	"errors" // errors.Is を使うため
	"fmt"
	"testing" // testing パッケージ
	"time"

	"myproject/processor" // テスト対象のパッケージをインポート (パスは例)
)

// (TestProcessDataWithContext_Success は前のセクションと同じなので省略)

// 異常系テスト: 明示的にキャンセルする場合
func TestProcessDataWithContext_Cancel(t *testing.T) {
	// ★ キャンセル可能な Context を作成 ★
	ctx, cancel := context.WithCancel(context.Background())
	// ★ defer で cancel を呼び出す (テスト終了時に確実にリソース解放) ★
	defer cancel()

	input := "test-data-3"
	errChan := make(chan error, 1) // エラーを受け取るためのチャネル

	// --- テスト対象関数を Goroutine で実行 ---
	// (または、cancel を別の Goroutine で実行しても良い)
	go func() {
		_, err := processor.ProcessDataWithContext(ctx, input)
		errChan <- err // 完了後、エラー (または nil) をチャネルに送信
	}()

	// --- 少し待ってからキャンセルを実行 ---
	// ProcessDataWithContext の処理時間 (150ms) より短い時間待つ (例: 50ms)
	time.Sleep(50 * time.Millisecond)
	fmt.Println("TestProcessDataWithContext_Cancel: cancel() を呼び出します...")
	cancel() // ★ Context をキャンセル ★

	// --- 結果を検証 ---
	// Goroutine からエラーを受け取る (タイムアウトも設定するとより安全)
	select {
	case err := <-errChan:
		// ★ エラーが発生することを期待 ★
		if err == nil {
			t.Errorf("キャンセルエラーが発生しませんでした。")
			return
		}
		// ★ 返されたエラーが context.Canceled であることを確認 ★
		if !errors.Is(err, context.Canceled) {
			t.Errorf("期待したエラーは context.Canceled ですが、実際は %v (%T)", err, err)
		} else {
			fmt.Println("TestProcessDataWithContext_Cancel: 期待通りキャンセルされました。")
		}
	case <-time.After(1 * time.Second): // 念のためテスト自体のタイムアウト
		t.Errorf("テストがタイムアウトしました (Goroutine が終了しませんでした)。")
	}
}

/*
テスト実行コマンド: go test -v ./...

実行結果の例:
=== RUN   TestProcessDataWithContext_Cancel
  (ProcessData: 'test-data-3' の処理開始)
TestProcessDataWithContext_Cancel: cancel() を呼び出します...
  (ProcessData: 'test-data-3' の処理キャンセル: context canceled)
TestProcessDataWithContext_Cancel: 期待通りキャンセルされました。
--- PASS: TestProcessDataWithContext_Cancel (0.05s)
PASS
ok  	myproject/processor	0.XXXs
*/
```

**コード解説:**

*   `ctx, cancel := context.WithCancel(context.Background())`: キャンセル可能な Context を作成します。
*   `defer cancel()`: テスト終了時に `cancel` が呼ばれるようにします。
*   テスト対象関数 `processor.ProcessDataWithContext` を Goroutine で実行し、結果のエラーを `errChan` に送信するようにします。
*   メインのテスト Goroutine は `time.Sleep(50 * time.Millisecond)` で少し待機した後、`cancel()` を呼び出して Context をキャンセルします。この待機時間は、テスト対象関数の処理時間より短く設定します。
*   `err := <-errChan`: Goroutine から返されるエラーをチャネル経由で受け取ります（テストがハングしないように、ここにもタイムアウトを設定するのが望ましいです）。
*   `errors.Is(err, context.Canceled)` を使って、受け取ったエラーが期待通り `context.Canceled` であることを検証します。

このように、テストコード内で `context.WithCancel` と `cancel()` 関数をタイミングよく使うことで、Context の明示的なキャンセルに対する関数の応答性をテストすることができます。