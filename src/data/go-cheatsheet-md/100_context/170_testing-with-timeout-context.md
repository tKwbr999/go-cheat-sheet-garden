---
title: "Context パッケージ: タイムアウト Context を使ったテスト"
tags: ["context", "concurrency", "testing", "timeout", "WithTimeout", "errors.Is", "DeadlineExceeded"]
---

`context.Context` を受け取る関数を実装した場合、その関数が Context によるタイムアウトやキャンセルに**正しく応答するかどうか**をテストすることが重要です。テストコード内で意図的にタイムアウトする Context を生成し、テスト対象関数に渡すことで、タイムアウト時の挙動を確認できます。

## テストの手順

1.  **テスト用の Context を生成:** `context.WithTimeout` を使って、テスト対象の処理が完了するよりも**短い**タイムアウト期間を持つ Context を生成します。`defer cancel()` を忘れないようにします。
2.  **テスト対象関数を呼び出し:** 生成したタイムアウト付き Context をテスト対象の関数に渡して呼び出します。
3.  **エラーを検証:** テスト対象の関数がエラーを返すことを期待します。その返されたエラー `err` に対して `errors.Is(err, context.DeadlineExceeded)` を呼び出し、`true` が返ることを確認します。これにより、関数がタイムアウトによって正しくキャンセルされたことを検証できます。

## コード例

時間のかかる処理を模倣し、Context のキャンセルに応答する関数 `processDataWithContext` をテストする例です。

**テスト対象のコード (`processor.go` - 例):**
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
	// 処理に時間がかかると仮定 (例: 150ms)
	processingTime := 150 * time.Millisecond

	select {
	case <-time.After(processingTime):
		// 処理完了
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
package processor_test // テスト対象とは別のパッケージ名にするのが一般的

import (
	"context"
	"errors" // errors.Is を使うため
	"fmt"
	"testing" // testing パッケージ
	"time"

	"myproject/processor" // テスト対象のパッケージをインポート (パスは例)
)

// 正常系テスト: タイムアウトしない場合
func TestProcessDataWithContext_Success(t *testing.T) {
	// タイムアウト時間を処理時間より長く設定 (例: 500ms)
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	input := "test-data-1"
	expectedResult := "processed: test-data-1"

	result, err := processor.ProcessDataWithContext(ctx, input)

	// エラーが発生しないことを確認
	if err != nil {
		t.Errorf("予期せぬエラーが発生しました: %v", err)
	}

	// 結果が期待通りか確認
	if result != expectedResult {
		t.Errorf("期待値 '%s', しかし結果は '%s'", expectedResult, result)
	}
	fmt.Println("TestProcessDataWithContext_Success: 完了")
}

// 異常系テスト: タイムアウトする場合
func TestProcessDataWithContext_Timeout(t *testing.T) {
	// ★ タイムアウト時間を処理時間 (150ms) より短く設定 (例: 50ms) ★
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	input := "test-data-2"

	result, err := processor.ProcessDataWithContext(ctx, input)

	// ★ エラーが発生することを期待 ★
	if err == nil {
		t.Errorf("タイムアウトエラーが発生しませんでした。結果: %s", result)
		return // エラーがない場合は以降のチェックは不要
	}

	// ★ 返されたエラーが context.DeadlineExceeded であることを確認 ★
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("期待したエラーは context.DeadlineExceeded ですが、実際は %v (%T)", err, err)
	} else {
		fmt.Println("TestProcessDataWithContext_Timeout: 期待通りタイムアウトしました。")
	}

	// タイムアウトした場合の結果は空文字列であることを確認 (例)
	if result != "" {
		t.Errorf("タイムアウトした場合の結果は空文字列のはずですが、実際は '%s'", result)
	}
}

/*
テスト実行コマンド: go test -v ./...

実行結果の例:
=== RUN   TestProcessDataWithContext_Success
  (ProcessData: 'test-data-1' の処理開始)
  (ProcessData: 'test-data-1' の処理完了)
TestProcessDataWithContext_Success: 完了
--- PASS: TestProcessDataWithContext_Success (0.15s)
=== RUN   TestProcessDataWithContext_Timeout
  (ProcessData: 'test-data-2' の処理開始)
  (ProcessData: 'test-data-2' の処理キャンセル: context deadline exceeded)
TestProcessDataWithContext_Timeout: 期待通りタイムアウトしました。
--- PASS: TestProcessDataWithContext_Timeout (0.05s)
PASS
ok  	myproject/processor	0.XXXs
*/
```

**コード解説:**

*   `TestProcessDataWithContext_Success`: タイムアウト時間 (500ms) を処理時間 (150ms) より長く設定し、関数がエラーなく完了し、期待通りの結果を返すことを検証します。
*   `TestProcessDataWithContext_Timeout`: タイムアウト時間 (50ms) を処理時間 (150ms) より**短く**設定します。
    *   `processor.ProcessDataWithContext` を呼び出すと、処理が終わる前に Context がタイムアウトするため、エラーが返されることを期待します (`err == nil` でないことを確認)。
    *   さらに、返されたエラー `err` が `context.DeadlineExceeded` であることを `errors.Is(err, context.DeadlineExceeded)` を使って検証します。

このようにテストコード内で意図的にタイムアウトする Context を使うことで、Context を受け取る関数が時間制限に対して正しく動作するかどうかを確認できます。同様の方法で `context.WithCancel` を使って、明示的なキャンセルに対するテストも記述できます（次のセクション）。