---
title: "標準ライブラリ: `time` パッケージ (時間と日付)"
tags: ["packages", "standard library", "time", "日付", "時刻", "Duration", "Format", "Parse", "Sleep", "Since"]
---

Go言語で現在時刻を取得したり、日付や時間を扱ったり、処理時間を計測したり、一定時間処理を待機させたりするには、標準ライブラリの **`time`** パッケージを利用します。

`import "time"` として利用します。

## 主要な型

*   **`time.Time`**: 特定の瞬間（時刻）を表す構造体。年、月、日、時、分、秒、ナノ秒、タイムゾーンなどの情報を含みます。
*   **`time.Duration`**: 時間の間隔（期間）を表す型。内部的には `int64` でナノ秒単位の時間を保持します。`time.Second`, `time.Millisecond`, `time.Hour` などの便利な定数が用意されています。

## 現在時刻の取得: `time.Now()`

現在のローカル時刻に対応する `time.Time` 型の値を取得します。

```go
now := time.Now()
fmt.Println("現在時刻:", now)
```

## 特定の日時の生成

*   **`time.Date(year, month, day, hour, min, sec, nsec, loc)`**: 指定した年月日時分秒ナノ秒とロケーション (`*time.Location`) から `time.Time` を生成します。`time.Month` 型の定数（`time.January`, `time.February` など）を使います。ロケーションには `time.UTC` や `time.Local` などが使えます。
*   **`time.Parse(layout, value string)`**: 指定した**レイアウト文字列** (`layout`) に従って文字列 `value` を解析し、`time.Time` を生成します。

## 時間のフォーマットと解析: `Format()` と `Parse()`

Goの時間のフォーマットと解析は少し独特で、**特定の基準時刻**を使ったレイアウト文字列を指定します。

**基準時刻:** `Mon Jan 2 15:04:05 MST 2006` (アメリカ山岳部標準時 MST で、2006年1月2日 午後3時4分5秒)

*   **`t.Format(layout string) string`**: `time.Time` 型の値 `t` を、指定した `layout` 文字列に従ってフォーマットし、文字列として返します。レイアウト文字列には、基準時刻の各要素（`2006` で年、`01` で月、`02` で日、`15` で時、`04` で分、`05` で秒など）を組み合わせて使います。
*   **`time.Parse(layout, value string) (Time, error)`**: 文字列 `value` を、指定した `layout` 文字列に従って解析し、`time.Time` 型の値と `error` を返します。`layout` は `Format` と同じ基準時刻ベースのものを使います。

```go title="Format と Parse の例"
package main

import (
	"fmt"
	"time"
)

func main() {
	now := time.Now()
	fmt.Println("現在時刻 (デフォルト):", now)

	// Format: time.Time -> string
	// Go 独自のレイアウト文字列 "2006-01-02 15:04:05" を使う
	formatted := now.Format("2006-01-02 15:04:05")
	fmt.Println("フォーマット後 (YYYY-MM-DD HH:MM:SS):", formatted)

	// よく使うレイアウト定数も用意されている
	fmt.Println("RFC3339 形式:", now.Format(time.RFC3339))

	// Parse: string -> time.Time
	timeStr := "2023-10-27 10:30:00"
	layout := "2006-01-02 15:04:05" // 解析する文字列の形式に合わせたレイアウト
	parsedTime, err := time.Parse(layout, timeStr)
	if err != nil {
		fmt.Println("時刻解析エラー:", err)
	} else {
		fmt.Println("解析後の時刻:", parsedTime)
		fmt.Println("年:", parsedTime.Year(), "月:", parsedTime.Month(), "日:", parsedTime.Day())
	}
}
```

## 時間間隔 (`time.Duration`) と時間の計算

*   `time.Duration` 型の定数: `time.Nanosecond`, `time.Microsecond`, `time.Millisecond`, `time.Second`, `time.Minute`, `time.Hour`。
*   数値と掛けて使う: `10 * time.Second` (10秒), `500 * time.Millisecond` (500ミリ秒)。
*   `t.Add(d Duration)`: 時刻 `t` に期間 `d` を加えた新しい `time.Time` を返す。
*   `t.Sub(u Time)`: 2つの時刻 `t` と `u` の差を `time.Duration` として返す (`t - u`)。
*   `time.Since(t Time)`: 時刻 `t` から現在までの経過時間を `time.Duration` として返す (`time.Now().Sub(t)` と同じ)。
*   `time.Sleep(d Duration)`: 指定した期間 `d` だけ現在の Goroutine の実行を一時停止する。

## コード例: 時間の操作

```go title="time パッケージの様々な機能"
package main

import (
	"fmt"
	"time"
)

func main() {
	// --- 現在時刻と要素へのアクセス ---
	now := time.Now()
	fmt.Printf("現在: 年=%d, 月=%d (%s), 日=%d, 時=%d, 分=%d, 秒=%d\n",
		now.Year(), now.Month(), now.Month().String(), now.Day(),
		now.Hour(), now.Minute(), now.Second())
	fmt.Println("曜日:", now.Weekday()) // time.Weekday 型 (Sunday, Monday, ...)

	// --- 特定の日時を作成 ---
	tokyo, _ := time.LoadLocation("Asia/Tokyo") // タイムゾーンを指定
	t1 := time.Date(2024, time.May, 1, 12, 0, 0, 0, tokyo)
	fmt.Println("指定した日時 (東京):", t1)

	// --- 時間の加算・減算 ---
	oneHourLater := now.Add(1 * time.Hour)
	thirtyMinutesAgo := now.Add(-30 * time.Minute)
	fmt.Println("1時間後:", oneHourLater)
	fmt.Println("30分前:", thirtyMinutesAgo)

	// --- 時間差の計算 ---
	diff := oneHourLater.Sub(thirtyMinutesAgo)
	fmt.Printf("差 (Duration): %v\n", diff) // 1h30m0s
	fmt.Printf("差 (分): %.0f 分\n", diff.Minutes()) // 90 分
	fmt.Printf("差 (秒): %.0f 秒\n", diff.Seconds()) // 5400 秒

	// --- スリープ ---
	fmt.Println("2秒待機します...")
	startTime := time.Now()
	time.Sleep(2 * time.Second)
	fmt.Println("待機終了。")

	// --- 経過時間の測定 ---
	elapsed := time.Since(startTime) // startTime からの経過時間
	fmt.Printf("経過時間: %v (約 %.2f 秒)\n", elapsed, elapsed.Seconds())
}

/* 実行結果 (実行時刻によって変わります):
現在: 年=2025, 月=3 (March), 日=28, 時=17, 分=4, 秒=11 (例)
曜日: Friday
指定した日時 (東京): 2024-05-01 12:00:00 +0900 JST
1時間後: 2025-03-28 18:04:11.123456 +0900 JST m=+3600.000000001 (例)
30分前: 2025-03-28 16:34:11.123456 +0900 JST m=-1800.000000001 (例)
差 (Duration): 1h30m0s
差 (分): 90 分
差 (秒): 5400 秒
2秒待機します...
待機終了。
経過時間: 2.001234567s (約 2.00 秒) (例)
*/
```

`time` パッケージは、時刻の取得、計算、フォーマット、スリープ、タイマーなど、時間に関連する様々な機能を提供しており、多くのアプリケーションで利用されます。特にフォーマット/解析のレイアウト文字列はGo独自のものなので、基準時刻 `2006-01-02 15:04:05 MST` を覚えておくと便利です。