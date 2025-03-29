## タイトル
title: 複数の変数をまとめて宣言する

## タグ
tags: ["basics", "変数", "var", ":="]

## コード
```go
package main

import "fmt"

// ダミー関数 (複数の値を返す)
func getConfig() (string, int, bool) {
	return "localhost", 8080, true
}

func main() {
	// `:=` を使って複数の変数を宣言・初期化
	// 左辺の変数と右辺の値が順番に対応
	host, port, enabled := "example.com", 443, true
	fmt.Println(host, port, enabled)

	// 関数の複数の戻り値を一度に受け取る
	serverHost, serverPort, serverEnabled := getConfig()
	fmt.Println(serverHost, serverPort, serverEnabled)

	// 一部の戻り値だけ必要な場合は _ を使う
	_, portOnly, _ := getConfig()
	fmt.Println("Port only:", portOnly)
}

```

## 解説
```text
関連する複数の変数を一度に宣言する方法がいくつかあります。

**1. `var()` ブロック:**
`var` キーワードの後に括弧 `()` を続け、ブロック内に複数の変数を宣言します。型が異なってもOK。パッケージレベルでも使用可能。
```go
var (
    appName = "App"
    version = 1
    debugMode bool
)
```

**2. 一行での複数宣言 (同じ型):**
同じ型の変数は一行で宣言できます。
`var x, y, z int` (ゼロ値で初期化)
`var width, height = 100, 50` (型推論)

**3. `:=` を使った複数宣言・初期化 (関数内のみ):**
短縮変数宣言 `:=` でも複数変数を扱えます。左辺の変数名と右辺の値をカンマ `,` で区切って対応させます。型は右辺から推論されます。
`name, age := "Alice", 30`

**関数の複数戻り値の受け取り:**
Goの関数は複数の値を返すことができます。`:=` を使うと、これらの戻り値を一度に受け取ることができ、特にエラー処理で頻繁に使われます。
`value, err := functionReturningValueAndError()`
不要な戻り値はブランク識別子 `_` で無視できます。
`valueOnly, _ := functionReturningValueAndError()`

これらの方法を使い分け、コードの可読性を保ちつつ効率的に変数を宣言しましょう。