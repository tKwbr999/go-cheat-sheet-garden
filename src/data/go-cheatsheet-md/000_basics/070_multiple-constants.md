---
title: "複数の定数をまとめて宣言 `const()`"
tags: ["basics", "定数", "const"]
---

関連性の高い定数が複数ある場合、それらを個別に `const` で宣言するよりも、まとめて宣言する方がコードがすっきりと読みやすくなります。Go言語では `const()` ブロックを使って複数の定数を一度に宣言できます。

## `const()` ブロックを使った宣言

`const` キーワードの後に括弧 `()` を続けることで、そのブロック内に複数の定数宣言を記述できます。これは `var()` ブロックで複数の変数を宣言するのと似ています。

```go title="const() ブロックでの複数定数宣言"
package main

import "fmt"

// const() ブロックを使って関連する定数をまとめる
const (
	AppName    = "My Awesome App" // アプリケーション名
	Version    = "1.0.0"          // バージョン情報
	Author     = "Roo"            // 作者
	MaxRetries = 3                // 最大リトライ回数
)

// HTTPステータスコードのように、意味的に関連する数値を定数として定義する例
const (
	StatusOK                   = 200 // 成功
	StatusBadRequest           = 400 // クライアントエラー: 不正なリクエスト
	StatusUnauthorized         = 401 // クライアントエラー: 認証が必要
	StatusForbidden            = 403 // クライアントエラー: アクセス禁止
	StatusNotFound             = 404 // クライアントエラー: 見つからない
	StatusInternalServerError = 500 // サーバーエラー: 内部エラー
)

func main() {
	fmt.Println("--- アプリ情報 ---")
	fmt.Println("アプリ名:", AppName)
	fmt.Println("バージョン:", Version)
	fmt.Println("作者:", Author)
	fmt.Println("最大リトライ回数:", MaxRetries)

	fmt.Println("\n--- HTTPステータスコード例 ---")
	fmt.Println("成功:", StatusOK)
	fmt.Println("見つからない:", StatusNotFound)
	fmt.Println("内部エラー:", StatusInternalServerError)

	// 定数は計算にも使える
	if MaxRetries > 1 {
		fmt.Println("\nリトライ可能です。")
	}
}

/* 実行結果:
--- アプリ情報 ---
アプリ名: My Awesome App
バージョン: 1.0.0
作者: Roo
最大リトライ回数: 3

--- HTTPステータスコード例 ---
成功: 200
見つからない: 404
内部エラー: 500

リトライ可能です。
*/
```

**コード解説:**

*   `const (...)`: このブロック内に、宣言したい定数を一行ずつ `定数名 = 値` の形式で記述します。
*   型は、個別に指定することもできますが、右辺の値から推論できる場合は省略するのが一般的です（例: `AppName`, `StatusOK` など）。
*   関連する定数を `const()` ブロックでまとめることで、コードの意図が明確になり、可読性が向上します。例えば、HTTPステータスコードのように、一連の関連する値を定義する場合に非常に便利です。

次のセクションでは、連続した値を簡単に生成できる `iota` という仕組みを見ていきます。