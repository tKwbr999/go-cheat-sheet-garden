## タイトル
title: `switch` 文と初期化ステートメント

## タグ
tags: ["flow-control", "switch", "case", "default", "初期化ステートメント", "スコープ"]

## コード
```go
package main

import (
	"fmt"
	"math/rand"
)

// ランダムなステータスコードを返す (例)
func getStatusCode() int {
	codes := []int{200, 400, 404, 500, 503}
	return codes[rand.Intn(len(codes))]
}

func main() {
	// 初期化ステートメントで値を取得し、switch で評価
	switch code := getStatusCode(); code {
	case 200:
		fmt.Println("ステータス: OK (200)")
	case 400:
		fmt.Println("ステータス: Bad Request (400)")
	case 404:
		fmt.Println("ステータス: Not Found (404)")
	case 500:
		fmt.Println("ステータス: Internal Server Error (500)")
	default:
		fmt.Printf("ステータス: 不明 (%d)\n", code)
	}
	// fmt.Println(code) // エラー: code は switch の外では未定義
}

```

## 解説
```text
`if` 文と同様に、`switch` 文でも評価する式の直前に
**短い初期化ステートメント**を実行できます。

**構文:** `switch 初期化ステートメント; 式 { ... }`

*   **初期化ステートメント:**
    `switch` の式を評価する**前**に一度だけ実行されます。
    通常、`switch` 内で使う一時変数を宣言・初期化します。
    例: `code := getStatusCode()`
*   **式:**
    初期化ステートメントで宣言した変数などを使い、
    `case` と比較する値を指定します。例: `code`
*   **スコープ:**
    初期化ステートメントで宣言された変数は、
    その `switch` 文の**内部でのみ有効**です。

**利点:**
1.  **スコープ限定:** `switch` 文の中だけで使う変数を
    外部に漏らさず、コードをきれいに保てます。
2.  **コード簡潔化:** 変数宣言と `switch` をまとめて書けます。

特に関数の結果を受け取ってすぐにその値で分岐したい場合に
便利で、Goのコードでよく見られます。
(例: `runtime.GOOS` でOSごとに分岐するなど)