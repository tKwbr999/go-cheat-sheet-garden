## タイトル
title: Context パッケージ: HTTP クライアントでのタイムアウト/キャンセル

## タグ
tags: ["context", "concurrency", "net/http", "http client", "timeout", "deadline", "cancel", "NewRequestWithContext", "Do"]

## コード
```go
package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"
)

func main() {
	// タイムアウト付き Context (例: 50ms)
	requestTimeout := 50 * time.Millisecond
	ctx, cancel := context.WithTimeout(context.Background(), requestTimeout)
	defer cancel() // ★ 必ず cancel を呼ぶ

	// Context 付きリクエスト作成
	url := "https://example.com"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil { /* エラー処理 */ return }

	fmt.Printf("GET %s (Timeout: %v)...\n", url, requestTimeout)

	// リクエスト実行
	resp, err := http.DefaultClient.Do(req)
	// ★ エラーがあってもなくても resp.Body を閉じる必要あり
	if resp != nil {
		defer resp.Body.Close()
	}

	// エラーチェック
	if err != nil {
		fmt.Fprintf(os.Stderr, "Request Error: %v\n", err)
		// タイムアウトかチェック
		if errors.Is(err, context.DeadlineExceeded) {
			fmt.Fprintln(os.Stderr, "-> Timeout!")
		}
		return
	}

	// 成功時の処理 (例)
	fmt.Printf("Status: %s\n", resp.Status)
	// body, _ := io.ReadAll(resp.Body) // ボディ読み取りなど
}

```

## 解説
```text
外部への HTTP リクエストでは、応答遅延や無応答に備え、
タイムアウトやキャンセル処理を入れることが重要です。
`context` パッケージと `net/http` を組み合わせることで実現できます。

**`http.NewRequestWithContext`:**
リクエスト作成時に Context を関連付けます。
`req, err := http.NewRequestWithContext(ctx, method, url, body)`
*   `ctx`: `WithTimeout`, `WithDeadline`, `WithCancel` で
    生成した Context を渡します。

**`client.Do(req)` とエラーハンドリング:**
`http.Client` (通常 `http.DefaultClient`) の `Do` メソッドで
Context 付きリクエスト `req` を送信します。
`resp, err := client.Do(req)`

*   **Context キャンセル時の動作:**
    リクエスト処理中に `ctx` がキャンセルされる
    (タイムアウト、デッドライン超過、`cancel()` 呼び出し) と、
    `client.Do` は**エラーを返します**。
*   **エラー理由の判定:** 返された `err` に対し、
    `errors.Is(err, context.DeadlineExceeded)` や
    `errors.Is(err, context.Canceled)` を使って、
    キャンセル理由を特定できます。
    (ネットワークエラー等、他の原因の場合もあります)

**重要: `resp.Body.Close()`**
`client.Do` がエラーを返した場合でも、`resp` が `nil` でない
可能性があります。レスポンスボディ `resp.Body` が存在する場合は、
**必ず `defer resp.Body.Close()` で閉じる**必要があります。
エラーチェックの `if err != nil` ブロックの**前**に `defer` を
書くか、`if resp != nil` の中で `defer` するのが一般的です。

コード例では、短いタイムアウトを設定した Context を使って
リクエストを作成・実行し、`client.Do` が返すエラーを
`errors.Is` でチェックしてタイムアウトを検出しています。

`net/http` クライアントで `context` を使うことで、
外部サービスへのリクエストに対するタイムアウト制御や
キャンセル処理を容易に実装できます。