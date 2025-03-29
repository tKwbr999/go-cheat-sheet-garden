## タイトル
title: Context の受け渡し規約

## タグ
tags: ["context", "concurrency", "規約", "関数シグネチャ", "第一引数"]

## コード
```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 下位関数: Context を受け取りキャンセルをチェック
func queryDatabase(ctx context.Context, query string) (string, error) {
	fmt.Printf(" DB Query: '%s'\n", query)
	select {
	case <-time.After(100 * time.Millisecond): // 処理模倣
		fmt.Printf(" Query OK: '%s'\n", query)
		return "data", nil
	case <-ctx.Done(): // ★ キャンセルチェック
		fmt.Printf(" Query Cancelled: '%s' (%v)\n", query, ctx.Err())
		return "", ctx.Err()
	}
}

// 上位関数: Context を受け取り下位関数に渡す
func handleRequest(ctx context.Context, requestData string) error {
	fmt.Println("Request Handling Start")
	// ★ 下位関数に ctx をそのまま渡す
	result, err := queryDatabase(ctx, "find:"+requestData)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	fmt.Printf("Result: %s\n", result)
	return nil
}

// main (呼び出し元)
// func main() {
// 	ctx := context.Background()
// 	ctxTimeout, cancel := context.WithTimeout(ctx, 50*time.Millisecond)
// 	defer cancel()
// 	handleRequest(ctxTimeout, "some-data") // Context を渡す
// }

```

## 解説
```text
`context.Context` を関数間で受け渡す際の**規約 (Convention)**:

**規約: 第一引数として `ctx context.Context` を渡す**
*   ブロッキング可能性のある関数、外部リソースアクセス関数、
    リクエスト処理の一部となる関数は、**第一引数**として
    `ctx context.Context` を受け取るべき。
*   引数名は慣習的に `ctx`。
*   `ctx` は**決して `nil` であってはならない**。
    不明な場合は一時的に `context.TODO()` を使うが、
    最終的には適切な Context に置き換えるべき。
*   `Context` を**構造体のフィールドに埋め込むべきではない**。
    必ず引数として明示的に渡す。

コード例:
*   `queryDatabase` 関数は第一引数に `ctx` を受け取り、
    `select` で `ctx.Done()` をチェックしています。
*   `handleRequest` 関数も第一引数に `ctx` を受け取り、
    それをそのまま `queryDatabase` に渡しています。
*   呼び出し元 (`main` など) は、`context.Background()` や
    `context.WithTimeout` などで生成した Context を
    `handleRequest` の第一引数に渡します。

この規約に従うことで、キャンセルシグナルやデッドライン等が
プログラム全体で一貫して伝達され、コードの可読性・保守性が向上します。
標準ライブラリや多くのサードパーティライブラリもこの規約に従っています。