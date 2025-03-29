## タイトル
title: 標準ライブラリ: `time` パッケージ (時間と日付)

## タグ
tags: ["packages", "standard library", "time", "日付", "時刻", "Duration", "Format", "Parse", "Sleep", "Since"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	// 現在時刻
	now := time.Now()
	fmt.Println("Now:", now)

	// フォーマット (Go独自レイアウト: 2006-01-02 15:04:05)
	formatted := now.Format("2006-01-02 15:04:05")
	fmt.Println("Formatted:", formatted)

	// 解析 (文字列 -> time.Time)
	layout := "2006-01-02"
	parsed, _ := time.Parse(layout, "2023-10-27")
	fmt.Println("Parsed:", parsed)

	// 時間の加算・差
	oneHourLater := now.Add(1 * time.Hour)
	diff := oneHourLater.Sub(now)
	fmt.Printf("1 hour later: %v, Diff: %v\n", oneHourLater, diff)

	// スリープ
	fmt.Println("Sleeping 1 sec...")
	start := time.Now()
	time.Sleep(1 * time.Second)

	// 経過時間
	elapsed := time.Since(start)
	fmt.Printf("Elapsed: %v\n", elapsed)
}

```

## 解説
```text
**`time`** パッケージは、時刻の取得、日付や時間の操作、
処理時間の計測、待機など、時間に関する機能を提供します。
`import "time"` で利用します。

**主要な型:**
*   **`time.Time`**: 特定の瞬間（時刻）を表す構造体。
    年,月,日,時,分,秒,ナノ秒,タイムゾーン等を含む。
*   **`time.Duration`**: 時間の間隔を表す型 (内部 `int64` ナノ秒)。
    `time.Second`, `time.Millisecond` 等の定数あり。

**主な機能:**
*   **`time.Now()`**: 現在のローカル時刻 (`time.Time`) を取得。
*   **`time.Date(...)`**: 指定日時で `time.Time` を生成。
*   **フォーマット `t.Format(layout)`**:
    `time.Time` を文字列に変換。Go独自の**基準時刻**
    `Mon Jan 2 15:04:05 MST 2006` を使ったレイアウト文字列
    (例: `"2006-01-02"`, `"15:04"`) を指定する。
    `time.RFC3339` 等の定義済みレイアウトもある。
*   **解析 `time.Parse(layout, value)`**:
    文字列 `value` を `layout` に従って `time.Time` に変換。
    レイアウトは `Format` と同じ基準時刻ベース。
*   **時間計算:**
    *   `t.Add(d Duration)`: 時刻 `t` に期間 `d` を加算。
    *   `t.Sub(u Time)`: 時刻 `t` と `u` の差 (`Duration`)。
    *   `time.Since(t Time)`: `t` から現在までの経過時間 (`Duration`)。
*   **待機 `time.Sleep(d Duration)`**: 期間 `d` だけ実行を一時停止。

コード例はこれらの基本的な使い方を示しています。
`time` パッケージは多くのアプリケーションで必須となります。
特にフォーマット/解析のレイアウトはGo独自なので注意が必要です。