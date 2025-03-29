## タイトル
title: "Context パッケージ: 呼び出しスタックを通じた Context の伝播"
## タグ
tags: ["context", "concurrency", "関数呼び出し", "伝播", "http"]
`context.Context` の重要な役割の一つは、キャンセルシグナル、デッドライン、リクエストスコープの値を、一連の関数呼び出し（呼び出しスタック）を通じて伝達することです。

Context を関数間でどのように渡すべきか（第一引数としてそのまま渡す）という規約については、**「Context の受け渡し規約」** (`100_context/020_passing-context-convention.md`) や **「Context の伝播」** (`100_context/030_chaining-context-aware-functions.md`) で説明しました。

ここでは、HTTPリクエスト処理を例に、Context がどのように伝播していくかを再確認します。

## HTTPリクエスト処理における Context 伝播

1.  **リクエストの開始:** HTTPサーバーがリクエストを受け取ると、通常、そのリクエストに対応するベースとなる Context が生成されます（`net/http` サーバーでは `r.Context()` で取得できます）。
2.  **ミドルウェア:** 認証、ロギング、リクエストID付与などのミドルウェアは、受け取った Context を基に `context.WithValue` などで新しい Context を生成し、次のハンドラに渡します。
3.  **メインハンドラ:** リクエストを処理するメインのハンドラ関数は、ミドルウェアから渡された Context を受け取ります。必要であれば、`context.WithTimeout` などでさらに派生させた Context を生成します。
4.  **下位の関数呼び出し:** ハンドラが内部で呼び出すビジネスロジック関数、データベースアクセス関数、外部API呼び出し関数などには、**受け取った Context (またはそこから派生させた Context) をそのまま第一引数として渡します**。
5.  **最下層の処理:** データベースドライバや HTTP クライアントなど、ブロッキングする可能性のある I/O 操作を行う関数は、渡された Context の `Done()` チャネルを監視し、キャンセルされれば処理を中断します。

このように Context をリクエスト処理の開始から終了まで一貫して引き回すことで、タイムアウトやクライアントからのキャンセル要求が、処理のどの段階にいても適切に伝播し、関連するすべての Goroutine が効率的に停止できるようになります。

## コード例 (HTTP ハンドラからの伝播)

```go title="HTTP ハンドラから下位関数への Context 伝播"
package main

import (
	"context"
	"errors" // errors パッケージをインポート
	"fmt"
	"net/http"
	"time"
)

// 下位の処理 (例: 外部 API 呼び出し)
func callExternalAPI(ctx context.Context, param string) (string, error) {
	fmt.Printf("  (外部API呼び出し '%s' 開始...)\n", param)
	select {
	case <-time.After(150 * time.Millisecond): // API 応答に時間がかかると仮定
		fmt.Printf("  (外部API呼び出し '%s' 成功)\n", param)
		return fmt.Sprintf("API結果(%s)", param), nil
	case <-ctx.Done(): // ★ Context のキャンセルをチェック
		fmt.Printf("  (外部API呼び出し '%s' キャンセル: %v)\n", param, ctx.Err())
		return "", ctx.Err()
	}
}

// 中間の処理 (Context を受け取り、下位に渡す)
func processLogic(ctx context.Context, data string) (string, error) {
	fmt.Printf(" 中間処理 '%s' 開始...\n", data)
	// ★ 受け取った ctx をそのまま callExternalAPI に渡す ★
	result, err := callExternalAPI(ctx, data)
	if err != nil {
		return "", fmt.Errorf("中間処理失敗: %w", err)
	}
	processedResult := fmt.Sprintf("処理済み: %s", result)
	fmt.Printf(" 中間処理 '%s' 完了\n", data)
	return processedResult, nil
}

// HTTP ハンドラ (リクエストの起点)
func handleRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Println("\n--- リクエスト受信 ---")
	// リクエストから Context を取得 (ミドルウェアで値が追加されている可能性もある)
	ctx := r.Context()

	// このリクエスト処理全体のタイムアウトを設定 (例: 200ms)
	ctxWithTimeout, cancel := context.WithTimeout(ctx, 200*time.Millisecond)
	defer cancel() // ハンドラ終了時に cancel を呼ぶ

	// ★ タイムアウト付き Context を下位の処理に渡す ★
	result, err := processLogic(ctxWithTimeout, "input-data")
	if err != nil {
		// エラーの種類に応じて適切なステータスコードを返す
		statusCode := http.StatusInternalServerError
		if errors.Is(err, context.DeadlineExceeded) {
			statusCode = http.StatusGatewayTimeout // タイムアウトの場合
		}
		http.Error(w, err.Error(), statusCode)
		fmt.Printf("--- リクエスト処理エラー: %v ---\n", err)
		return
	}

	// 成功レスポンス
	fmt.Fprintf(w, "成功: %s", result)
	fmt.Println("--- リクエスト処理成功 ---")
}

func main() {
	http.HandleFunc("/", handleRequest)
	fmt.Println("サーバーをポート :8080 で起動します...")
	// エラーハンドリングを追加
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Printf("サーバー起動エラー: %v\n", err)
	}
}
```

## 解説
```text
`context.Context` の重要な役割の一つは、キャンセルシグナル、デッドライン、リクエストスコープの値を、一連の関数呼び出し（呼び出しスタック）を通じて伝達することです。

Context を関数間でどのように渡すべきか（第一引数としてそのまま渡す）という規約については、**「Context の受け渡し規約」** (`100_context/020_passing-context-convention.md`) や **「Context の伝播」** (`100_context/030_chaining-context-aware-functions.md`) で説明しました。

ここでは、HTTPリクエスト処理を例に、Context がどのように伝播していくかを再確認します。

## HTTPリクエスト処理における Context 伝播

1.  **リクエストの開始:** HTTPサーバーがリクエストを受け取ると、通常、そのリクエストに対応するベースとなる Context が生成されます（`net/http` サーバーでは `r.Context()` で取得できます）。
2.  **ミドルウェア:** 認証、ロギング、リクエストID付与などのミドルウェアは、受け取った Context を基に `context.WithValue` などで新しい Context を生成し、次のハンドラに渡します。
3.  **メインハンドラ:** リクエストを処理するメインのハンドラ関数は、ミドルウェアから渡された Context を受け取ります。必要であれば、`context.WithTimeout` などでさらに派生させた Context を生成します。
4.  **下位の関数呼び出し:** ハンドラが内部で呼び出すビジネスロジック関数、データベースアクセス関数、外部API呼び出し関数などには、**受け取った Context (またはそこから派生させた Context) をそのまま第一引数として渡します**。
5.  **最下層の処理:** データベースドライバや HTTP クライアントなど、ブロッキングする可能性のある I/O 操作を行う関数は、渡された Context の `Done()` チャネルを監視し、キャンセルされれば処理を中断します。

このように Context をリクエスト処理の開始から終了まで一貫して引き回すことで、タイムアウトやクライアントからのキャンセル要求が、処理のどの段階にいても適切に伝播し、関連するすべての Goroutine が効率的に停止できるようになります。

**コード解説:**

*   `handleRequest` は `r.Context()` でリクエストの Context を取得し、`context.WithTimeout` でタイムアウトを設定した `ctxWithTimeout` を作成します。
*   `processLogic` は `ctxWithTimeout` を受け取り、それをそのまま `callExternalAPI` に渡します。
*   `callExternalAPI` は渡された Context (`ctx`) の `Done()` チャネルを `select` で監視します。
*   `main` 関数で設定されたタイムアウト (200ms) は、`handleRequest` -> `processLogic` -> `callExternalAPI` へと伝播します。`callExternalAPI` 内の `time.After(150 * time.Millisecond)` はタイムアウト内に完了しますが、もしこれが 200ms より長ければ、`<-ctx.Done()` が先に発生し、`context.DeadlineExceeded` エラーが返され、呼び出し元に伝播していきます。

このように、Context を呼び出しスタックを通じて適切に伝播させることで、リクエスト全体のライフサイクル（タイムアウトやキャンセル）を一貫して管理することができます。

**実行方法と結果:**

サーバー起動後、 `http://localhost:8080/` にアクセスすると、
コンソールに以下のようなログが出力され、ブラウザにはエラーが表示されます。

```
--- リクエスト受信 ---
 中間処理 'input-data' 開始...
  (外部API呼び出し 'input-data' 開始...)
  (外部API呼び出し 'input-data' キャンセル: context deadline exceeded)
--- リクエスト処理エラー: 中間処理失敗: 外部API呼び出し 'input-data' キャンセル: context deadline exceeded ---
```

もし `context.WithTimeout` の時間を 200ms より長く (例: 300ms) 設定すれば、
API呼び出しが成功し、ブラウザにも成功メッセージが表示されます。