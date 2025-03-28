---
title: "エクスポートされる識別子: パッケージの外から使える名前"
tags: ["basics", "パッケージ", "命名規則", "エクスポート", "公開", "キャメルケース"]
---

Goのプログラムはパッケージという単位で構成されますが、パッケージ内で定義したすべての要素（変数、定数、関数、型など）が他のパッケージから自由にアクセスできるわけではありません。

他のパッケージから利用できるように意図された要素を**エクスポート (Export)** する（公開する）必要があり、Go言語にはそのための明確なルールがあります。

## 識別子とは？

まず、**識別子 (Identifier)** とは、変数、定数、関数、型、パッケージなどに付ける「名前」のことです。例えば、`myVariable`, `Pi`, `CalculateTotal`, `User` などが識別子にあたります。

## Goのエクスポートルール: 大文字始まり

Go言語では、識別子が他のパッケージからアクセス可能（エクスポートされる）かどうかは、その名前の**最初の文字が大文字かどうか**だけで決まります。

*   **大文字で始まる識別子:** 他のパッケージからアクセス**可能**（エクスポートされる、公開される）。
*   **小文字で始まる識別子:** その識別子が定義されたパッケージ内からのみアクセス**可能**（エクスポートされない、非公開）。

このルールは非常にシンプルで強力です。

## 命名規則: キャメルケース (CamelCase)

Goでは、複数の単語からなる識別子には**キャメルケース (CamelCase)** を使うのが一般的です。キャメルケースは、単語の先頭を大文字にし、間にスペースや記号を入れずに繋げる書き方です。

*   **アッパーキャメルケース (Upper Camel Case) / パスカルケース (PascalCase):** 最初の単語も含めて、すべての単語の先頭を大文字にする。（例: `MyVariable`, `CalculateTotal`, `UserInfo`）
*   **ローワーキャメルケース (lower Camel Case):** 最初の単語は小文字で始め、後続の単語の先頭を大文字にする。（例: `myVariable`, `calculateTotal`, `userInfo`）

Goのエクスポートルールと組み合わせると、以下のようになります。

*   **エクスポートされる識別子 (公開):** **アッパーキャメルケース** を使います。（例: `MaxUsers`, `ReadFile`, `CustomerData`）
*   **エクスポートされない識別子 (非公開):** **ローワーキャメルケース** を使います。（例: `maxUsers`, `readFile`, `customerData`）

## コード例

簡単な `greeting` パッケージと、それを利用する `main` パッケージの例を見てみましょう。

```go title="greeting/greeting.go: エクスポートされる要素を持つパッケージ"
// greeting パッケージの定義
package greeting

// エクスポートされる定数 (大文字始まり)
const DefaultPrefix = "Hello, "

// エクスポートされない定数 (小文字始まり)
const defaultSuffix = "!"

// エクスポートされる関数 (大文字始まり)
// 名前を受け取り、挨拶文を返す
func Say(name string) string {
	// パッケージ内の非公開関数を呼び出す
	return formatMessage(name)
}

// エクスポートされない関数 (小文字始まり)
// パッケージ内部でのみ使用されるヘルパー関数
func formatMessage(name string) string {
	// パッケージ内の公開定数と非公開定数を使用
	return DefaultPrefix + name + defaultSuffix
}

// エクスポートされる型 (大文字始まり)
type Message struct {
	// エクスポートされるフィールド (大文字始まり)
	Text string
	// エクスポートされないフィールド (小文字始まり)
	priority int // このフィールドは greeting パッケージの外からはアクセスできない
}

// エクスポートされる変数 (大文字始まり) - パッケージ変数の使用は慎重に
var DefaultMessage = Message{Text: "Default Greeting", priority: 0}
```

```go title="main.go: greeting パッケージを利用する"
package main

import (
	"fmt"
	"myapp/greeting" // 上記の greeting パッケージをインポート (パスは例)
)

func main() {
	// greeting パッケージのエクスポートされた関数 Say を呼び出す
	message := greeting.Say("Gopher")
	fmt.Println(message) // 出力: Hello, Gopher!

	// greeting パッケージのエクスポートされた定数 DefaultPrefix を参照
	fmt.Println(greeting.DefaultPrefix) // 出力: Hello,

	// greeting パッケージのエクスポートされた変数 DefaultMessage を参照
	fmt.Println(greeting.DefaultMessage.Text) // 出力: Default Greeting

	// greeting パッケージのエクスポートされない要素にはアクセスできない
	// fmt.Println(greeting.defaultSuffix) // コンパイルエラー: cannot refer to unexported name greeting.defaultSuffix
	// greeting.formatMessage("Test")      // コンパイルエラー: cannot refer to unexported name greeting.formatMessage
	// fmt.Println(greeting.DefaultMessage.priority) // コンパイルエラー: DefaultMessage.priority is not exported
}

/* 実行結果:
Hello, Gopher!
Hello,
Default Greeting
*/
```

**ポイント:**

*   `greeting` パッケージの `DefaultPrefix`, `Say`, `Message`, `DefaultMessage` は大文字で始まっているため、`main` パッケージから `greeting.Say` のように `パッケージ名.` を付けてアクセスできます。
*   `greeting` パッケージの `defaultSuffix`, `formatMessage`, `Message` 構造体の `priority` フィールドは小文字で始まっているため、`main` パッケージからアクセスしようとするとコンパイルエラーになります。

この大文字・小文字による公開・非公開のルールは、パッケージの内部実装を隠蔽し、外部に提供するインターフェースを明確にするために役立ちます。