## タイトル
title: データベース操作でのタイムアウト/キャンセル

## タグ
tags: ["context", "concurrency", "database/sql", "QueryContext", "ExecContext", "BeginTx", "PingContext", "timeout", "cancel"]

## コード
```go
package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"
	// _ "github.com/mattn/go-sqlite3" // 実際のドライバ
)

// ダミーのDBクエリ関数 (Context をチェック)
func dummyQueryContext(ctx context.Context, db *sql.DB, query string) error {
	fmt.Printf("Query: %s\n", query)
	select {
	case <-time.After(200 * time.Millisecond): // 200ms かかると仮定
		fmt.Println(" -> Query Success (Dummy)")
		// _, err := db.QueryContext(ctx, query) // 実際の呼び出し
		// return err
		return nil
	case <-ctx.Done(): // Context キャンセルをチェック
		fmt.Printf(" -> Query Cancelled: %v\n", ctx.Err())
		return ctx.Err()
	}
}

func main() {
	// db, err := sql.Open("sqlite3", ":memory:") // 実際の接続例
	db := &sql.DB{} // ダミー
	// if err != nil { log.Fatal(err) }
	// defer db.Close()

	// 100ms でタイムアウトする Context
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	// QueryContext (を模倣した関数) を呼び出す
	err := dummyQueryContext(ctx, db, "SELECT ...")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		if errors.Is(err, context.DeadlineExceeded) {
			fmt.Println("-> Timeout!")
		}
	}
}

```

## 解説
```text
データベース操作は時間がかかる可能性があるため、
`context` を使ったタイムアウトやキャンセル処理が重要です。

標準の **`database/sql`** パッケージは Context をサポートしています。

**`database/sql` での Context 利用:**
`*sql.DB` や `*sql.Tx` の多くのメソッドには、
第一引数に `context.Context` を取る `...Context` 版があります。
*   `db.QueryContext(ctx, ...)`
*   `db.QueryRowContext(ctx, ...)`
*   `db.ExecContext(ctx, ...)`
*   `db.BeginTx(ctx, ...)`
*   `db.PingContext(ctx)`
*   (`tx.Commit`/`Rollback` は直接受け取らないが、Tx開始時の Context が影響)

これらのメソッドに `WithTimeout` や `WithDeadline` で生成した
Context を渡すことで、DB操作全体に時間制限を設けられます。

**エラーハンドリング:**
`...Context` メソッドが返す `error` をチェックします。
*   成功: `nil`
*   DBエラー: 固有のエラー (構文エラー、接続エラー等)
*   Contextキャンセル: `context.DeadlineExceeded` または
    `context.Canceled` (またはそれをラップしたエラー)。
    `errors.Is()` で確認可能。

コード例では、`dummyQueryContext` がDB操作を模倣し、
`select` で Context のキャンセルをチェックしています。
`main` では 100ms のタイムアウト付き Context を生成し、
`dummyQueryContext` (本来は `db.QueryContext` 等) に渡します。
処理 (200ms) がタイムアウトより長いため、Context がキャンセルされ、
`context.DeadlineExceeded` エラーが返されます。

DB操作のように時間がかかる処理では、`context` による
タイムアウト/キャンセル処理がアプリの安定性・応答性に不可欠です。
多くのDBドライバやORMも `context` をサポートしています。