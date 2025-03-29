## タイトル
title: Context パッケージ: タイムアウト/デッドライン超過の確認

## タグ
tags: ["context", "concurrency", "Err", "DeadlineExceeded", "Canceled", "errors.Is", "タイムアウト", "デッドライン"]

## コード
```go
package main

import (
	"context"
	"errors"
	"fmt"
	"time"
)

// Context のキャンセル理由を確認する関数
func checkContextStatus(ctx context.Context, name string) {
	select {
	case <-ctx.Done(): // キャンセル待ち
		err := ctx.Err() // 理由を取得
		fmt.Printf("%s: Cancelled. Reason: %v\n", name, err)
		// 理由を判定
		if err == context.DeadlineExceeded { // または errors.Is
			fmt.Printf("   -> %s: Timeout/Deadline\n", name)
		} else if err == context.Canceled { // または errors.Is
			fmt.Printf("   -> %s: Explicit Cancel\n", name)
		}
	case <-time.After(1 * time.Second): // タイムアウト待ち (デモ用)
		fmt.Printf("%s: Not cancelled within 1s\n", name)
	}
}

func main() {
	// タイムアウトケース
	ctxTimeout, cancelT := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancelT()
	checkContextStatus(ctxTimeout, "TimeoutCtx")

	// 明示的キャンセルケース
	ctxCancel, cancelC := context.WithCancel(context.Background())
	go func() { time.Sleep(100 * time.Millisecond); cancelC() }()
	checkContextStatus(ctxCancel, "CancelCtx")

	// ラップされたエラーの場合 (解説参照)
	// wrappedErr := fmt.Errorf("... %w", ctx.Err())
	// if errors.Is(wrappedErr, context.DeadlineExceeded) { ... }
}

```

## 解説
```text
Context がキャンセルされた際、その理由が
タイムアウト/デッドライン超過か、明示的な `cancel()` 呼び出しかを
区別したい場合があります。これは **`ctx.Err()`** の戻り値で可能です。

**`ctx.Err()` の戻り値:**
`ctx.Done()` がクローズされた**後**に `ctx.Err()` を呼ぶと、
以下の定義済みエラー値のいずれかを返します。
*   **`context.DeadlineExceeded`**: `WithTimeout` または
    `WithDeadline` の時間制限に達した場合。
*   **`context.Canceled`**: `WithCancel` の `cancel()` が
    呼ばれた場合 (または `WithTimeout`/`WithDeadline` で
    時間制限前に `cancel()` が呼ばれた場合)。
キャンセルされていなければ `nil` を返します。

**キャンセル理由の確認方法:**
`ctx.Err()` の戻り値と比較します。
*   **`==` で直接比較:**
    `if ctx.Err() == context.DeadlineExceeded { ... }`
    `ctx.Err()` が返すのは定義済みエラー値なので直接比較可能。
*   **`errors.Is()` で比較:**
    `if errors.Is(ctx.Err(), context.DeadlineExceeded) { ... }`
    もし `ctx.Err()` が `%w` でラップされている可能性がある場合は、
    `errors.Is` を使う方が堅牢です。
    (通常 `ctx.Err()` を直接チェックするなら `==` で十分)

コード例の `checkContextStatus` 関数は、`ctx.Done()` を待った後、
`ctx.Err()` の値を `==` で比較して理由を表示しています。
タイムアウトケースでは `DeadlineExceeded`、
明示的キャンセルケースでは `Canceled` が判定されます。

キャンセル理由を知ることで、タイムアウト固有の処理や
ユーザーによるキャンセル操作への対応など、より適切な
エラーハンドリングが可能になります。