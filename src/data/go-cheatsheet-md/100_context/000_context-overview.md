## タイトル
title: 概要

## タグ
tags: ["context", "concurrency", "キャンセル", "タイムアウト", "デッドライン", "値伝達", "リクエストスコープ"]

## コード
```go
package context // (実際には組み込み)

import "time"

// Context インターフェース定義
type Context interface {
	Deadline() (deadline time.Time, ok bool)
	Done() <-chan struct{}
	Err() error
	Value(key any) any
}

```

## 解説
```text
Go 1.7 で導入された **`context`** パッケージは、
Goroutine 間やAPI境界を越えて情報を伝達する標準的な方法を提供します。
特にサーバーアプリや分散システムで重要です。
`import "context"` で利用します。

**目的:**
主に以下の情報を伝達します。
1.  **キャンセルシグナル:** 不要になった処理を早期中断させる。
2.  **タイムアウト/デッドライン:** 処理の時間制限を設定する。
3.  **リクエストスコープ値:** リクエストIDや認証情報などを伝達。

**`context.Context` インターフェース:**
Context の中心となるインターフェース。
*   `Deadline()`: キャンセル時刻 (設定されていれば)。
*   `Done()`: キャンセル時にクローズされるチャネル (`<-chan struct{}`)。
    `select` でキャンセルを検知するのに使う。
*   `Err()`: キャンセル理由 (`context.Canceled` or
    `context.DeadlineExceeded`)。`Done()` がクローズされた後に確認。
*   `Value(key any)`: 関連付けられた値を取得。

**重要性:**
*   **リソース管理:** 不要な処理をキャンセルしリソースを効率化。
*   **応答性向上:** タイムアウトでシステム全体の遅延を防ぐ。
*   **トレーサビリティ:** リクエストID等を引き回し追跡を容易に。
*   **標準:** 多くのライブラリが `Context` を引数に取る設計。

`context` はGoの並行処理において、Goroutine間の連携や
リソース管理を行うための標準的で強力なツールです。