## タイトル
title: Context の生成 (`context` パッケージ)

## タグ
tags: ["concurrency", "goroutine", "context", "Background", "TODO", "WithCancel", "WithTimeout", "WithDeadline", "WithValue", "キャンセル", "タイムアウト"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"time"
)

type contextKey string // Value 用のキー型
const userIDKey contextKey = "userID"

func main() {
	// 1. ルート Context (通常 Background を使う)
	ctxBg := context.Background()
	fmt.Println("1. Background:", ctxBg)
	// ctxTodo := context.TODO() // 未定の場合のプレースホルダー

	// 2. キャンセル可能 Context
	ctxCancel, cancelFunc := context.WithCancel(ctxBg)
	defer cancelFunc() // ★ 必ず cancel を呼ぶ
	fmt.Println("2. WithCancel:", ctxCancel)
	// cancelFunc() // 呼ぶとキャンセルされる

	// 3. タイムアウト付き Context
	ctxTimeout, cancelTimeout := context.WithTimeout(ctxBg, 100*time.Millisecond)
	defer cancelTimeout() // ★ 必ず cancel を呼ぶ
	fmt.Println("3. WithTimeout:", ctxTimeout)

	// 4. 値付き Context
	ctxValue := context.WithValue(ctxBg, userIDKey, "user-123")
	fmt.Println("4. WithValue:", ctxValue)
	retrieved := ctxValue.Value(userIDKey)
	fmt.Printf("   Value: %v (%T)\n", retrieved, retrieved)
}

```

## 解説
```text
Go 1.7 で導入された **`context`** パッケージは、
Goroutine 間やAPI境界を越えて、**デッドライン**、
**キャンセルシグナル**、**リクエストスコープ値**を
伝達する標準的な方法を提供します。
特にタイムアウトや早期キャンセルに不可欠です。
`import "context"` で利用します。

**`context.Context` インターフェース:**
Context の中心。以下のメソッドを持つ (通常は直接実装しない)。
*   `Deadline()`: キャンセル時刻。
*   `Done()`: キャンセル時にクローズされるチャネル (`<-chan struct{}`)。
*   `Err()`: キャンセル理由 (`Canceled` or `DeadlineExceeded`)。
*   `Value(key any)`: 関連付けられた値を取得。

**基本的な Context:**
すべての Context の起点。
*   **`context.Background()`**: 空の Context。キャンセルされず値も期限もない。
    通常、Context ツリーのルートとして使う。
*   **`context.TODO()`**: `Background()` と同じく空。
    どの Context を使うべきか不明な場合の一時的なプレースホルダー。

**派生 Context の生成:**
親 Context から新しい機能を持つ子 Context を生成。
*   **`context.WithCancel(parent)`**:
    キャンセル可能な子 `ctx` とキャンセル関数 `cancel` を返す。
    `cancel()` を呼ぶと `ctx` とその子孫がキャンセルされる。
    **重要:** `defer cancel()` で必ず `cancel` を呼ぶこと (リソースリーク防止)。
*   **`context.WithTimeout(parent, timeout)`**:
    指定期間 `timeout` 後に自動キャンセルされる Context を生成。
    `cancel` 関数も返され、`defer cancel()` が必要。
*   **`context.WithDeadline(parent, deadline)`**:
    絶対時刻 `deadline` で自動キャンセルされる Context を生成。
    `defer cancel()` が必要。
*   **`context.WithValue(parent, key, value)`**:
    キー・値ペアを関連付けた Context を生成。
    リクエストスコープ値の伝達に使う。キーには独自型推奨。
    キャンセルやデッドラインとは独立。

コード例は各種 Context の生成方法を示しています。
`defer cancel()` の呼び出し忘れに注意が必要です。
生成した Context は、Goroutine や関数に渡して利用します。