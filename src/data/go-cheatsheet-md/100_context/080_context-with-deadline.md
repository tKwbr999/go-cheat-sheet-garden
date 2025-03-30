## タイトル
title: デッドライン付き Context (`WithDeadline`)

## タグ
tags: ["context", "concurrency", "WithDeadline", "cancel", "タイムアウト", "デッドライン"]

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
	case <-ctx.Done(): // ★ デッドライン超過/キャンセル検知
		fmt.Printf("作業キャンセル: %v\n", ctx.Err())
		return ctx.Err()
	}
}

func main() {
	// 500ms 後をデッドラインとして設定
	deadline := time.Now().Add(500 * time.Millisecond)
	ctx, cancel := context.WithDeadline(context.Background(), deadline)
	defer cancel() // ★ 必ず cancel を呼ぶ

	// 1秒かかる処理を実行 -> デッドラインを超えるはず
	err := simulateWork(ctx, 1*time.Second)
	if err != nil {
		fmt.Printf("エラー: %v\n", err) // context deadline exceeded
	}
}

```

## 解説
```text
**`context.WithDeadline`** は、**絶対的な時刻（デッドライン）**を
指定し、その時刻になると自動的にキャンセルされる Context を生成します。
(`WithTimeout` は相対的な時間)

**基本:**
`ctx, cancel := context.WithDeadline(parentCtx, deadlineTime)`
*   親 Context `parentCtx` とデッドライン時刻 `deadlineTime` (`time.Time`) を
    受け取り、新しい子 Context `ctx` と `cancel` 関数を返す。
*   指定時刻 `deadlineTime` になると `ctx` の `Done()` チャネルが
    自動的にクローズされ、`Err()` は `context.DeadlineExceeded` を返す。
*   デッドライン前でも `cancel()` を呼べば明示的にキャンセル可能。
*   **重要:** `defer cancel()` で必ず `cancel` 関数を呼ぶこと。
    (デッドライン超過後でもリソース解放のために必要)

**`WithTimeout` との関係:**
`context.WithTimeout(parent, timeout)` は内部的に
`context.WithDeadline(parent, time.Now().Add(timeout))` を
呼び出すのと同じです。

コード例では、現在から 500ms 後をデッドライン `deadline` として設定し、
`context.WithDeadline` で `ctx` を作成しています。
1秒かかる `simulateWork` に `ctx` を渡すと、処理完了前に
デッドライン時刻を迎えるため、`simulateWork` 内の `select` は
`ctx.Done()` を検知し、`context.DeadlineExceeded` エラーが返ります。

もし処理時間がデッドラインより短ければ、エラーなく完了します。

`context.WithDeadline` は、特定の絶対時刻までに処理を
完了させたい場合に便利です (例: 「今日の17時まで」)。
相対時間で十分なら `context.WithTimeout` が一般的です。