## タイトル
title: Context パッケージ: タイムアウト付き Context (`WithTimeout`)

## タグ
tags: ["context", "concurrency", "WithTimeout", "cancel", "タイムアウト", "デッドライン"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"time"
)

// Context のキャンセルをチェックする関数
func simulateWork(ctx context.Context, duration time.Duration) error {
	fmt.Printf("作業開始 (最大 %v)\n", duration)
	select {
	case <-time.After(duration): // 処理模倣
		fmt.Println("作業完了")
		return nil
	case <-ctx.Done(): // ★ タイムアウト/キャンセル検知
		fmt.Printf("作業キャンセル: %v\n", ctx.Err())
		return ctx.Err()
	}
}

func main() {
	// 500ms でタイムアウトする Context を作成
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel() // ★ 必ず cancel を呼ぶ

	// 1秒かかる処理を実行 -> タイムアウトするはず
	err := simulateWork(ctx, 1*time.Second)
	if err != nil {
		fmt.Printf("エラー: %v\n", err) // context deadline exceeded
	}
}

```

## 解説
```text
処理に時間制限を設けたい場合、**`context.WithTimeout`** を使います。
指定時間が経過すると自動的にキャンセルされる Context を生成します。

**基本:**
`ctx, cancel := context.WithTimeout(parentCtx, timeoutDuration)`
*   親 Context `parentCtx` とタイムアウト期間 `timeoutDuration` を
    受け取り、新しい子 Context `ctx` と `cancel` 関数を返す。
*   `timeoutDuration` が経過すると `ctx` の `Done()` チャネルが
    自動的にクローズされ、`Err()` は `context.DeadlineExceeded` を返す。
*   タイムアウト前でも `cancel()` を呼べば明示的にキャンセル可能。
*   **重要:** `defer cancel()` で必ず `cancel` 関数を呼ぶこと。
    (タイムアウトした場合でもリソース解放のために必要)

コード例では、500ms でタイムアウトする `ctx` を作成し、
1秒かかる `simulateWork` に渡しています。
`simulateWork` 内の `select` は、処理完了 (`time.After`) より先に
Context のキャンセル (`ctx.Done()`) を検知するため、
タイムアウト処理が実行され、`context.DeadlineExceeded` エラーが返ります。

もし処理時間がタイムアウトより短ければ、`time.After` の `case` が
実行され、正常に完了します。

`context.WithTimeout` は、外部API呼び出しやDBクエリなど、
応答時間に上限を設けたい場合に非常に便利です。