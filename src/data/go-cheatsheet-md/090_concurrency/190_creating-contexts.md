---
title: "並行処理: Context の生成 (`context` パッケージ)"
tags: ["concurrency", "goroutine", "context", "Background", "TODO", "WithCancel", "WithTimeout", "WithDeadline", "WithValue", "キャンセル", "タイムアウト"]
---

Go 1.7 で導入された **`context`** パッケージは、APIの境界やプロセス間、Goroutine 間で、**デッドライン (Deadline)**、**キャンセルシグナル (Cancellation Signal)**、その他の**リクエストスコープの値**を伝達するための標準的な方法を提供します。

特に、複数の Goroutine にまたがる処理や、外部リソースへのアクセス（HTTPリクエスト、データベースクエリなど）を行う際に、処理のタイムアウトや早期キャンセルを実現するために不可欠なパッケージです。

`import "context"` として利用します。

## `context.Context` インターフェース

`context` パッケージの中心となるのは `Context` インターフェースです。

```go
type Context interface {
    Deadline() (deadline time.Time, ok bool) // コンテキストがキャンセルされる時刻
    Done() <-chan struct{}                   // コンテキストがキャンセルされるとクローズされるチャネル
    Err() error                              // Done() がクローズされた理由 (Canceled or DeadlineExceeded)
    Value(key any) any                       // コンテキストに関連付けられた値を取得
}
```

通常、`Context` インターフェースを直接実装することはなく、`context` パッケージが提供する関数を使って生成・利用します。

## 基本的な Context

すべての Context は、以下のいずれかの基本的な Context から派生します。

*   **`context.Background()`**:
    *   空の Context を返します。値もデッドラインも持たず、キャンセルされることもありません。
    *   通常、リクエスト処理の最上位（例: `main` 関数やリクエストハンドラの開始時）で、これから生成する Context ツリーの**ルート**として使用されます。
*   **`context.TODO()`**:
    *   `Background()` と同じく空の Context を返します。
    *   どの Context を使うべきか不明な場合や、まだ Context を受け取るように関数が更新されていない場合に、**一時的なプレースホルダー**として使用します。コードがリファクタリングされ、適切な Context が渡されるようになるべき箇所を示すために使われます。

## 派生 Context の生成

基本的な Context (`Background` や `TODO`、または他の派生 Context) を親として、新しい機能（キャンセル、タイムアウト、値の保持）を持つ子 Context を生成できます。

*   **`context.WithCancel(parent Context) (ctx Context, cancel CancelFunc)`**:
    *   親 Context `parent` をラップし、新しいキャンセル可能な子 Context `ctx` と、それをキャンセルするための関数 `cancel` を返します。
    *   `cancel()` 関数を呼び出すと、`ctx` と、`ctx` から派生したすべての Context がキャンセルされます（`ctx.Done()` チャネルがクローズされます）。
    *   **重要:** `cancel` 関数は、`ctx` が不要になった時点（通常は `ctx` を渡した処理が完了した後）で**必ず呼び出す**必要があります。リソースリークを防ぐため、**`defer cancel()`** を使うのが定石です。

*   **`context.WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc)`**:
    *   `WithCancel` と似ていますが、指定した `timeout` 期間が経過すると**自動的にキャンセル**される Context を生成します。
    *   タイムアウト前でも、返された `cancel` 関数を呼び出すことで明示的にキャンセルすることも可能です。
    *   `defer cancel()` は同様に必要です。

*   **`context.WithDeadline(parent Context, d time.Time) (Context, CancelFunc)`**:
    *   `WithTimeout` と似ていますが、相対的な期間ではなく、**絶対的な時刻 `d`** をデッドラインとして指定します。その時刻になると自動的にキャンセルされます。
    *   `defer cancel()` は同様に必要です。

*   **`context.WithValue(parent Context, key, val any) Context`**:
    *   親 Context `parent` に、キー `key` と値 `val` を関連付けた新しい Context を返します。
    *   リクエストスコープのデータ（リクエストID、ユーザー認証情報など）を関数呼び出し間で伝達するために使われます。
    *   **注意:** `WithValue` は、キャンセルやデッドラインとは異なり、オプションの情報を渡すためのものです。関数のパラメータとして明示的に渡すべき情報を `Context` 経由で渡すのは避けるべきです。キーの衝突を避けるため、キーには独自に定義した型を使うのが一般的です。

## コード例: Context の生成

```go title="様々な Context の生成"
package main

import (
	"context"
	"fmt"
	"time"
)

// Value のキーとして使うための独自型 (キー衝突を避ける)
type contextKey string

const userIDKey contextKey = "userID"

func main() {
	// 1. ルートとなる Background Context
	ctxBg := context.Background()
	fmt.Println("1. Background Context:", ctxBg)

	// 2. キャンセル可能な Context
	// WithCancel は新しい Context と cancel 関数を返す
	ctxCancel, cancelFunc := context.WithCancel(ctxBg)
	// ★★★ 重要: cancel 関数は必ず呼び出す (リソースリーク防止) ★★★
	defer cancelFunc() // main 関数終了時に cancelFunc が呼ばれる
	fmt.Println("2. WithCancel Context:", ctxCancel)
	// cancelFunc() // ここで呼び出すと即座にキャンセルされる

	// 3. タイムアウト付き Context (例: 100ミリ秒後)
	timeoutDuration := 100 * time.Millisecond
	ctxTimeout, cancelTimeout := context.WithTimeout(ctxBg, timeoutDuration)
	defer cancelTimeout() // タイムアウトしても cancel は呼ぶべき
	fmt.Println("3. WithTimeout Context:", ctxTimeout)

	// 4. デッドライン付き Context (例: 1秒後)
	deadline := time.Now().Add(1 * time.Second)
	ctxDeadline, cancelDeadline := context.WithDeadline(ctxBg, deadline)
	defer cancelDeadline() // デッドラインを過ぎても cancel は呼ぶべき
	fmt.Println("4. WithDeadline Context:", ctxDeadline)

	// 5. 値付き Context
	userID := "user-12345"
	ctxValue := context.WithValue(ctxBg, userIDKey, userID)
	fmt.Println("5. WithValue Context:", ctxValue)

	// 値の取得 (Value メソッドを使う)
	retrievedUserID := ctxValue.Value(userIDKey)
	// 型アサーションで元の型に戻す
	if uidStr, ok := retrievedUserID.(string); ok {
		fmt.Printf("   Context から取得した userID: %s\n", uidStr)
	}

	// 派生した Context をさらに派生させることも可能
	ctxCancelWithValue := context.WithValue(ctxCancel, "anotherKey", "anotherValue")
	defer context.WithCancel(ctxCancelWithValue) // この cancel も必要
	fmt.Println("6. 派生 Context:", ctxCancelWithValue)

	fmt.Println("\nContext の生成例はここまで。")
	// この後、これらの Context を Goroutine や関数に渡して利用する (次のセクション以降)
}

/* 実行結果の例 (Context の文字列表現は内部詳細であり、変わりうる):
1. Background Context: context.Background
2. WithCancel Context: context.Background.WithCancel
3. WithTimeout Context: context.Background.WithDeadline(2025-03-29 01:44:00.123456789 +0900 JST m=+0.100000001 [100ms])
4. WithDeadline Context: context.Background.WithDeadline(2025-03-29 01:45:00.023456789 +0900 JST m=+1.000000001 [1s])
5. WithValue Context: context.Background.WithValue(type main.contextKey, val user-12345)
   Context から取得した userID: user-12345
6. 派生 Context: context.Background.WithCancel.WithValue(type string, val anotherValue)

Context の生成例はここまで。
*/
```

**コード解説:**

*   `context.Background()` でルートとなる Context を作成します。
*   `context.WithCancel`, `context.WithTimeout`, `context.WithDeadline` は、親 Context と、それぞれキャンセル関数、タイムアウト期間、デッドライン時刻を引数に取り、新しい子 Context と `cancel` 関数を返します。
*   **`defer cancel()`**: 返された `cancel` 関数は、関連する処理が完了した時点で必ず呼び出す必要があります。`defer` を使うことで、関数がどのように終了しても（正常終了、`return`、`panic`）、`cancel` が確実に呼ばれるようにします。これにより、Context に関連付けられたリソース（タイマーなど）が適切に解放されます。
*   `context.WithValue` は、親 Context、キー、値を引数に取り、値が関連付けられた新しい Context を返します。値を取得するには `Value(key)` メソッドと型アサーションを使います。

`context` パッケージは、Goの並行処理において、Goroutine間のシグナル伝達やタイムアウト管理を行うための標準的で強力な方法です。次のセクションでは、これらの Context を実際に使って Goroutine のキャンセル制御を行う方法を見ていきます。