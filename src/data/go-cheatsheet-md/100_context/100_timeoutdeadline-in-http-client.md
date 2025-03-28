---
title: "Context パッケージ: HTTP クライアントでのタイムアウト/キャンセル"
tags: ["context", "concurrency", "net/http", "http client", "timeout", "deadline", "cancel", "NewRequestWithContext", "Do"]
---

外部の Web サーバーに HTTP リクエストを送る際、サーバーからの応答が遅い、あるいは全く返ってこない場合に、クライアント側で無期限に待ち続けるのは避けたい状況です。`context` パッケージを使うと、`net/http` クライアントの**リクエスト全体**（接続、リクエスト送信、応答待機を含む）に対してタイムアウトやデッドラインを設定したり、処理の途中でキャンセルしたりすることができます。

## `http.NewRequestWithContext`

`http.Request` を作成する際に、`http.NewRequest` の代わりに **`http.NewRequestWithContext`** を使います。この関数は第一引数に `context.Context` を取ります。

**構文:** `req, err := http.NewRequestWithContext(ctx context.Context, method, url string, body io.Reader)`

*   `ctx`: このリクエストに関連付ける Context。`context.WithTimeout` や `context.WithDeadline`, `context.WithCancel` で生成した Context を渡します。
*   `method`: HTTP メソッド ("GET", "POST" など)。
*   `url`: リクエスト先の URL 文字列。
*   `body`: リクエストボディ (POST などで必要ない場合は `nil`)。

## `client.Do(req)` とエラーハンドリング

作成した `http.Request` (`req`) は、`http.Client` の `Do` メソッドを使って送信します。

**構文:** `resp, err := client.Do(req)`

*   `client`: `http.Client` のインスタンス（通常は `http.DefaultClient` か、カスタム設定したクライアント）。
*   `req`: `NewRequestWithContext` で作成したリクエスト。

**エラーハンドリング:**

*   `client.Do(req)` は、リクエストが成功すればレスポンス (`*http.Response`) と `nil` エラーを返します。
*   リクエストの処理中に `req` に関連付けられた Context がキャンセルされた（タイムアウト、デッドライン超過、または `cancel()` 呼び出し）場合、`client.Do` は**エラーを返します**。
*   このエラー `err` に対して `errors.Is(err, context.DeadlineExceeded)` や `errors.Is(err, context.Canceled)` を使って、キャンセルがタイムアウト/デッドラインによるものか、明示的なキャンセルによるものかを判定できます。
*   ネットワークエラーなど、Context のキャンセル以外の理由でエラーが発生する場合もあります。

**重要:** `client.Do` がエラーを返した場合でも、`resp` が `nil` でない可能性があります（例えばリダイレクト中にタイムアウトした場合など）。レスポンスボディ (`resp.Body`) が存在する場合は、**必ず `defer resp.Body.Close()` で閉じる**必要があります。

## コード例: HTTP GET リクエストのタイムアウト

```go title="HTTP GET リクエストにタイムアウトを設定"
package main

import (
	"context"
	"errors" // errors.Is を使うため
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

func main() {
	// 非常に短いタイムアウト (10ミリ秒) を設定した Context を作成
	// (通常の Web サイトへのアクセスではほぼ確実にタイムアウトする)
	requestTimeout := 10 * time.Millisecond
	ctx, cancel := context.WithTimeout(context.Background(), requestTimeout)
	// ★ defer で cancel を呼び出すのを忘れない ★
	defer cancel()

	// リクエストを作成 (Context を関連付ける)
	url := "https://example.com"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "リクエスト作成エラー: %v\n", err)
		return
	}

	fmt.Printf("'%s' に GET リクエストを送信します (タイムアウト: %v)...\n", url, requestTimeout)

	// デフォルトの HTTP クライアントでリクエストを実行
	resp, err := http.DefaultClient.Do(req)

	// ★★★ エラーチェック ★★★
	if err != nil {
		fmt.Fprintf(os.Stderr, "リクエスト実行エラー: %v\n", err)

		// エラーがタイムアウト/デッドラインによるものかチェック
		if errors.Is(err, context.DeadlineExceeded) {
			fmt.Fprintln(os.Stderr, "-> 原因: リクエストがタイムアウトしました。")
		} else if errors.Is(err, context.Canceled) {
			fmt.Fprintln(os.Stderr, "-> 原因: リクエストがキャンセルされました。")
		} else {
			// その他のネットワークエラーなど
			fmt.Fprintln(os.Stderr, "-> 原因: タイムアウト以外のエラーです。")
		}

		// エラーがあっても resp が nil でない場合があるので Body を閉じる
		if resp != nil {
			// ボディは読まなくても Close は必要
			resp.Body.Close()
		}
		return // エラー発生時はここで終了
	}

	// --- 成功した場合 (タイムアウトしなかった場合) ---
	// ★★★ 重要: エラーがなくても Body は必ず閉じる ★★★
	defer resp.Body.Close()

	fmt.Printf("レスポンスステータス: %s\n", resp.Status)

	// レスポンスボディを読み取る (例)
	bodyBytes, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		fmt.Fprintf(os.Stderr, "レスポンスボディ読み取りエラー: %v\n", readErr)
		return
	}
	fmt.Printf("レスポンスボディ (最初の50バイト): %s...\n", string(bodyBytes[:min(50, len(bodyBytes))]))
}

// min 関数 (Go 1.21 以降は標準ライブラリにある)
func min(a, b int) int {
	if a < b { return a }
	return b
}

/* 実行結果の例 (ネットワーク状況によりエラーメッセージは多少異なる可能性あり):
'https://example.com' に GET リクエストを送信します (タイムアウト: 10ms)...
リクエスト実行エラー: Get "https://example.com": context deadline exceeded (Client.Timeout exceeded while awaiting headers)
-> 原因: リクエストがタイムアウトしました。
*/
```

**コード解説:**

*   `context.WithTimeout` で非常に短いタイムアウト (10ms) を設定した `ctx` を作成します。
*   `http.NewRequestWithContext(ctx, ...)` で、この `ctx` を関連付けたリクエスト `req` を作成します。
*   `http.DefaultClient.Do(req)` を実行します。`example.com` へのアクセスは通常 10ms 以上かかるため、Context のタイムアウトが発生します。
*   `client.Do` はエラーを返します。`errors.Is(err, context.DeadlineExceeded)` でチェックすると `true` になり、「リクエストがタイムアウトしました」と出力されます。
*   `defer resp.Body.Close()` は、`client.Do` が成功した場合 (`err == nil`) でも、エラーが発生した場合 (`err != nil` かつ `resp != nil`) でも、`resp.Body` が存在すれば確実にクローズするために重要です。

`net/http` クライアントで `context` を使うことで、外部サービスへのリクエストに対するタイムアウト制御や、より大きな処理の一部として HTTP リクエストをキャンセルする、といったことが容易に実現できます。