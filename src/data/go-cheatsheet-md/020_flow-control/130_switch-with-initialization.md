---
title: "制御構文: `switch` 文と初期化ステートメント"
tags: ["flow-control", "switch", "case", "default", "初期化ステートメント", "スコープ", "runtime"]
---

`if` 文と同様に、Goの `switch` 文でも、評価する式の直前に**短い初期化ステートメント**（通常は変数の宣言と初期化）を実行できます。

## 構文: `switch 初期化ステートメント; 式 { ... }`

この構文を使うと、`switch` 文の中で使うための一時的な変数を宣言し、そのスコープを `switch` 文内に限定することができます。

```go title="switch 文と初期化ステートメント"
package main

import (
	"fmt"
	"math/rand"
	"runtime" // OSなどのランタイム情報を提供
	"time"
)

// ダミー関数: ランダムなステータスコードを返す
func getStatusCode() int {
	// Go 1.20 以降の推奨される乱数生成方法
	codes := []int{200, 400, 404, 500, 503}
	return codes[rand.Intn(len(codes))]
}

func main() {
	// --- 例1: OS によって処理を分岐 ---
	// 初期化ステートメントで OS 名を取得し、その値を switch で評価
	// os 変数はこの switch ブロック内でのみ有効
	switch os := runtime.GOOS; os {
	case "darwin":
		fmt.Println("実行環境: macOS (Darwin)")
	case "linux":
		fmt.Println("実行環境: Linux")
	case "windows":
		fmt.Println("実行環境: Windows")
	default:
		fmt.Printf("実行環境: %s (その他のOS)\n", os)
	}
	// fmt.Println(os) // エラー: os は switch ブロックの外では未定義

	fmt.Println() // 空行

	// --- 例2: 関数の戻り値で分岐 ---
	// 初期化ステートメントでステータスコードを取得し、その値を switch で評価
	// code 変数はこの switch ブロック内でのみ有効
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
		fmt.Printf("ステータス: 不明なコード (%d)\n", code)
	}
	// fmt.Println(code) // エラー: code は switch ブロックの外では未定義
}

/* 実行結果 (実行環境や乱数によって変わります):
実行環境: macOS (Darwin) (例)

ステータス: Not Found (404) (例)
*/
```

**コード解説:**

*   `switch os := runtime.GOOS; os { ... }`:
    *   `os := runtime.GOOS`: **初期化ステートメント**。`runtime.GOOS` は実行中のOS名（`"darwin"`, `"linux"`, `"windows"` など）を文字列で返します。ここで変数 `os` を宣言・初期化しています。
    *   `;`: 初期化ステートメントと評価する式を区切ります。
    *   `os`: **評価する式**。初期化ステートメントで宣言した変数 `os` の値を評価します。
    *   `case "darwin": ...`: `os` の値が `"darwin"` と一致した場合の処理。
*   `switch code := getStatusCode(); code { ... }`:
    *   `code := getStatusCode()`: **初期化ステートメント**。`getStatusCode()` 関数の戻り値で変数 `code` を宣言・初期化します。
    *   `code`: **評価する式**。変数 `code` の値を評価します。
    *   `case 200: ...`: `code` の値が `200` と一致した場合の処理。
*   **スコープ:** この構文で宣言された変数 (`os` や `code`) は、その `switch` 文の**内部でのみ有効**です。`switch` ブロックの外側からアクセスしようとするとコンパイルエラーになります。

## 利点

`if` 文の場合と同様に、`switch` 文で初期化ステートメントを使う利点は以下の通りです。

1.  **変数のスコープを限定できる:** `switch` 文の中だけで使う変数を外部に漏らさず、コードをきれいに保てます。
2.  **コードが簡潔になる:** 変数の宣言と `switch` 文をまとめて書けます。

特に関数の結果を受け取ってすぐにその値で分岐したい場合に、この構文は非常に便利で、Goのコードでよく見られます。