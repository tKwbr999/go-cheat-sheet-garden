## タイトル
title: Context パッケージ: タイムアウト Context を使ったテスト

## タグ
tags: ["context", "concurrency", "testing", "timeout", "WithTimeout", "errors.Is", "DeadlineExceeded"]

## コード
```go
package processor_test // テスト対象とは別パッケージ

import (
	"context"
	"errors"
	"testing" // testing パッケージ
	"time"

	"myproject/processor" // テスト対象パッケージ (パスは例)
)

// 正常系: タイムアウトしない
func TestProcessDataWithContext_Success(t *testing.T) {
	// 処理時間(150ms想定)より長いタイムアウト(500ms)
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	_, err := processor.ProcessDataWithContext(ctx, "test-success")
	if err != nil { // エラーが発生しないことを期待
		t.Errorf("予期せぬエラー: %v", err)
	}
}

// 異常系: タイムアウトする
func TestProcessDataWithContext_Timeout(t *testing.T) {
	// 処理時間(150ms想定)より短いタイムアウト(50ms)
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	_, err := processor.ProcessDataWithContext(ctx, "test-timeout")

	// エラーが発生することを期待
	if err == nil {
		t.Fatal("タイムアウトエラーが発生しませんでした")
	}
	// ★ エラーが DeadlineExceeded であることを確認 ★
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("期待したエラーは DeadlineExceeded ですが、実際は %v", err)
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
`context.Context` を受け取る関数が、タイムアウトやキャンセルに
正しく応答するかをテストすることが重要です。
テストコード内で意図的にタイムアウトする Context を生成し、
テスト対象関数に渡して挙動を確認します。

**テスト手順:**
1. **タイムアウト Context 生成:** `context.WithTimeout` で、
   テスト対象の処理時間より**短い**タイムアウト期間を持つ
   Context を生成 (`defer cancel()` も忘れずに)。
2. **関数呼び出し:** 生成した Context をテスト対象関数に渡す。
3. **エラー検証:**
   *   関数がエラーを返すことを確認 (`err == nil` でない)。
   *   返されたエラー `err` が `context.DeadlineExceeded` であることを
       **`errors.Is(err, context.DeadlineExceeded)`** で確認。

コード例の `TestProcessDataWithContext_Timeout` では、
処理時間 (150ms 想定) より短い 50ms のタイムアウトを設定した
`ctx` を `ProcessDataWithContext` に渡しています。
そして、返された `err` が `nil` でないこと、かつ
`errors.Is` で `context.DeadlineExceeded` であることを
`t.Error` や `t.Fatal` を使って検証しています。

`TestProcessDataWithContext_Success` では逆に、十分長い
タイムアウトを設定し、エラーが発生しないことを検証しています。

このようにテストコードでタイムアウトをシミュレートすることで、
Context を受け取る関数が時間制限に対して正しく動作するかを
確認できます。
(同様に `WithCancel` を使えば明示的キャンセルもテスト可能)