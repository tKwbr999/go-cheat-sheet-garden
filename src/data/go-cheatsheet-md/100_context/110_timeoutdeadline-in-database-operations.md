---
title: "Context パッケージ: データベース操作でのタイムアウト/キャンセル"
tags: ["context", "concurrency", "database/sql", "QueryContext", "ExecContext", "BeginTx", "PingContext", "timeout", "cancel"]
---

データベースへのクエリや更新操作は、ネットワークの遅延やデータベースサーバーの負荷状況によって時間がかかることがあります。このような操作に対しても、`context` パッケージを使ってタイムアウトを設定したり、処理を途中でキャンセルしたりすることが重要です。

Goの標準的なデータベースインターフェースである **`database/sql`** パッケージは、多くの操作で `context.Context` をサポートしています。

## `database/sql` での Context の利用

`*sql.DB` や `*sql.Tx` (トランザクション) のメソッドの多くには、第一引数として `context.Context` を受け取る `...Context` という名前のバージョンが用意されています。

*   **`db.QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)`**: クエリを実行し、結果セット (`*sql.Rows`) を返します。
*   **`db.QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row`**: 単一の行を返すクエリを実行します。
*   **`db.ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)`**: クエリを実行し、結果セットを返しません（INSERT, UPDATE, DELETE など）。
*   **`db.BeginTx(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error)`**: トランザクションを開始します。
*   **`db.PingContext(ctx context.Context) error`**: データベースへの接続を確認します。
*   **`tx.Commit()` / `tx.Rollback()`**: トランザクションのコミット/ロールバック。これら自体は `Context` を直接受け取りませんが、トランザクションを開始した `BeginTx` に渡した `Context` がキャンセルされると、トランザクション内の操作（`tx.QueryContext` など）が影響を受ける可能性があります。

これらの `...Context` メソッドに `context.WithTimeout` や `context.WithDeadline` で生成した Context を渡すことで、データベース操作全体（接続の取得、クエリの実行、結果の待機など）に時間制限を設けることができます。

## エラーハンドリング

`...Context` メソッドが返す `error` をチェックすることで、操作が成功したか、失敗したか、あるいは Context がキャンセルされた（タイムアウト/デッドライン超過）かを判断できます。

*   操作が成功すれば、エラーは `nil` です。
*   データベース固有のエラー（構文エラー、接続エラーなど）が発生すれば、そのエラーが返されます。
*   Context がキャンセルされた場合、`context.DeadlineExceeded` または `context.Canceled` が返されます（またはこれらをラップしたエラー）。`errors.Is()` を使って確認できます。

## コード例: クエリのタイムアウト

```go title="データベースクエリにタイムアウトを設定"
package main

import (
	"context"
	"database/sql" // database/sql パッケージ
	"errors"
	"fmt"
	"log"
	"time"

	// 実際のドライバをインポート (例: sqlite3)
	// ここではダミーのためコメントアウト
	// _ "github.com/mattn/go-sqlite3"
)

// ダミーの DB 接続とクエリ関数 (実際にはDBに接続する)
func openDummyDB() (*sql.DB, error) {
	// return sql.Open("sqlite3", ":memory:") // 実際の例
	return &sql.DB{}, nil // ダミーを返す
}

func dummyQueryContext(ctx context.Context, db *sql.DB, query string, args ...any) (*sql.Rows, error) {
	fmt.Printf("実行クエリ: %s, 引数: %v\n", query, args)
	// タイムアウトをシミュレート
	select {
	case <-time.After(200 * time.Millisecond): // 200ms かかると仮定
		fmt.Println("  -> クエリ成功 (ダミー)")
		// return db.QueryContext(ctx, query, args...) // 実際の呼び出し
		return &sql.Rows{}, nil // ダミーを返す
	case <-ctx.Done(): // Context のキャンセルをチェック
		fmt.Printf("  -> クエリキャンセル: %v\n", ctx.Err())
		return nil, ctx.Err()
	}
}

func main() {
	db, err := openDummyDB()
	if err != nil {
		log.Fatal("DB接続エラー:", err)
	}
	// defer db.Close() // 実際のDBでは必要

	query := "SELECT name FROM users WHERE id = ?"
	userID := 1

	// --- ケース1: タイムアウトするケース ---
	fmt.Println("--- ケース1: タイムアウト (100ms) ---")
	// 100ms でタイムアウトする Context を作成
	ctxTimeout, cancelTimeout := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancelTimeout()

	// QueryContext を呼び出す (クエリは 200ms かかる想定)
	rows1, err1 := dummyQueryContext(ctxTimeout, db, query, userID)
	if err1 != nil {
		fmt.Printf("エラー1: %v\n", err1)
		if errors.Is(err1, context.DeadlineExceeded) {
			fmt.Println("-> タイムアウトしました。")
		}
	} else {
		// 実際には rows1 を処理する
		fmt.Println("クエリ成功 (rows1)")
		// defer rows1.Close() // 実際のDBでは必要
	}

	// --- ケース2: タイムアウトしないケース ---
	fmt.Println("\n--- ケース2: 間に合う (500ms) ---")
	// 500ms でタイムアウトする Context を作成
	ctxOK, cancelOK := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancelOK()

	// QueryContext を呼び出す (クエリは 200ms で終わる想定)
	rows2, err2 := dummyQueryContext(ctxOK, db, query, userID)
	if err2 != nil {
		fmt.Printf("エラー2: %v\n", err2)
	} else {
		fmt.Println("クエリ成功 (rows2)")
		// defer rows2.Close() // 実際のDBでは必要
	}
}

/* 実行結果:
--- ケース1: タイムアウト (100ms) ---
実行クエリ: SELECT name FROM users WHERE id = ?, 引数: [1]
  -> クエリキャンセル: context deadline exceeded
エラー1: context deadline exceeded
-> タイムアウトしました。

--- ケース2: 間に合う (500ms) ---
実行クエリ: SELECT name FROM users WHERE id = ?, 引数: [1]
  -> クエリ成功 (ダミー)
クエリ成功 (rows2)
*/
```

**コード解説:**

*   `dummyQueryContext` 関数は、実際の `db.QueryContext` の呼び出しを模倣し、`select` を使って指定時間待機するか、Context がキャンセルされるのを待ちます。
*   **ケース1:** 100ms のタイムアウト付き Context `ctxTimeout` を `dummyQueryContext` に渡します。`dummyQueryContext` 内の処理 (200ms) が完了する前にタイムアウトが発生するため、`<-ctx.Done()` が選択され、`context.DeadlineExceeded` エラーが返されます。`main` 関数では `errors.Is` でこれを検知しています。
*   **ケース2:** 500ms のタイムアウト付き Context `ctxOK` を渡します。処理 (200ms) はタイムアウト前に完了するため、`<-time.After(...)` が選択され、エラーなく `nil` が返されます。

データベース操作のように時間がかかる可能性のある処理では、`context` を使ってタイムアウトやキャンセルを適切に処理することが、アプリケーション全体の安定性と応答性を保つために非常に重要です。多くのデータベースドライバや ORM (Object-Relational Mapper) ライブラリも `context` をサポートしています。