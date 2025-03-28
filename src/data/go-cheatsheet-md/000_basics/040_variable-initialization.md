---
title: "変数の初期化: 宣言と同時に値を設定"
tags: ["basics", "変数", "初期化", "型推論"]
---

変数を宣言する際には、多くの場合、同時に最初の値（**初期値**）を設定します。これを**初期化**と呼びます。初期化を行うことで、変数が意図しない値（ゼロ値）を持つことを防ぎ、コードの意図が明確になります。

## 初期化と型推論

`var` を使って変数を宣言する際に初期値を指定すると、多くの場合、型指定を省略できます。Goコンパイラが初期値から型を推論してくれるためです。

```go title="初期化時の型推論"
package main

import "fmt"

func main() {
	// var で宣言する際に初期値を指定すると、型を省略できる (型推論)
	var greeting = "おはよう" // "おはよう" は文字列なので、greeting は string 型と推論される
	var number = 100      // 100 は整数なので、number は int 型と推論される
	var ratio = 0.5       // 0.5 は浮動小数点数なので、ratio は float64 型と推論される

	fmt.Printf("greeting: 値=%s, 型=%T\n", greeting, greeting)
	fmt.Printf("number: 値=%d, 型=%T\n", number, number)
	fmt.Printf("ratio: 値=%f, 型=%T\n", ratio, ratio)

	// もちろん、型を明示的に指定することも可能
	var explicitType int = 200
	fmt.Printf("explicitType: 値=%d, 型=%T\n", explicitType, explicitType)
}

/* 実行結果:
greeting: 値=おはよう, 型=string
number: 値=100, 型=int
ratio: 値=0.500000, 型=float64
explicitType: 値=200, 型=int
*/
```

**ポイント:**

*   `var 変数名 = 初期値` のように書くと、コンパイラが `初期値` の型を判断し、自動的に `変数名` の型を決定します。
*   これは短縮変数宣言 `:=` と同じ型推論の仕組みです。
*   ただし、`var` は関数外（パッケージレベル）でも使用できますが、`:=` は関数内でのみ使用可能です。

## 関数の戻り値を使った初期化

変数の初期値には、他の関数を呼び出した結果（戻り値）を使用することもできます。

以下の例では、`os.Getenv` という関数を使って、コンピュータに設定されている**環境変数**の値を取得し、それで変数を初期化しています。

```go title="関数の戻り値で初期化"
package main

import (
	"fmt"
	"os" // os パッケージをインポート
)

// パッケージレベルの変数を関数の戻り値で初期化
var (
	// os.Getenv は指定された環境変数の値を文字列 (string) として返す
	homeDirectory = os.Getenv("HOME") // HOME 環境変数の値で初期化 (Unix系OSの場合)
	userName      = os.Getenv("USER") // USER 環境変数の値で初期化 (Unix系OSの場合)
	// Windows の場合は "HOMEPATH", "USERNAME" などを使う
	// goos := runtime.GOOS // OS を判定して切り替えることも可能
)

func main() {
	fmt.Println("ホームディレクトリ:", homeDirectory)
	fmt.Println("ユーザー名:", userName)

	// 環境変数が設定されていない場合、空文字列 "" が返る
	nonExistentVar := os.Getenv("MY_SPECIAL_VAR")
	fmt.Println("存在しない環境変数:", nonExistentVar) // 通常は空文字列が表示される
}

/* 実行結果 (環境によって異なります):
ホームディレクトリ: /Users/tk (例)
ユーザー名: tk (例)
存在しない環境変数:
*/
```

**コード解説:**

*   `import "os"`: 環境変数へのアクセスなど、OS（オペレーティングシステム）に関連する機能を提供する `os` パッケージをインポートしています。
*   `os.Getenv("環境変数名")`: 指定した名前の環境変数の値を文字列として返します。もしその環境変数が設定されていなければ、空文字列 `""` を返します。
*   `homeDirectory = os.Getenv("HOME")`: `os.Getenv("HOME")` が返す文字列（例: `/Users/yourname`）が `homeDirectory` 変数の初期値となります。型は `os.Getenv` の戻り値の型である `string` と推論されます。

このように、変数宣言時に初期値を設定する方法は様々あり、型推論を活用することでコードを簡潔に保つことができます。