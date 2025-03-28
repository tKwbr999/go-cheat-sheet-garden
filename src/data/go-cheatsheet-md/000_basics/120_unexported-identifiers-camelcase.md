---
title: "エクスポートされない識別子: パッケージ内部の名前"
tags: ["basics", "パッケージ", "命名規則", "非公開", "キャメルケース"]
---

前のセクションでは、他のパッケージから利用できる「エクスポートされる（公開される）」識別子について学びました。それに対して、パッケージの内部だけで使い、外部には公開したくない要素も存在します。これらは**エクスポートされない（非公開）**識別子と呼ばれます。

## Goの非公開ルール: 小文字始まり

Go言語では、識別子がエクスポートされない（非公開）かどうかは、その名前の**最初の文字が小文字かどうか**だけで決まります。

*   **小文字で始まる識別子:** その識別子が定義されたパッケージ内からのみアクセス**可能**（エクスポートされない、非公開）。
*   **大文字で始まる識別子:** 他のパッケージからもアクセス**可能**（エクスポートされる、公開）。

## 命名規則: ローワーキャメルケース (lower Camel Case)

エクスポートされない識別子には、**ローワーキャメルケース (lower Camel Case)** を使うのが一般的です。これは、最初の単語は小文字で始め、後続の単語の先頭を大文字にする書き方です。（例: `internalCounter`, `calculatePrice`, `defaultSettings`）

## なぜ非公開にするのか？

パッケージの内部実装の詳細を外部から隠蔽（**カプセル化**）するために、非公開の識別子を使います。

*   **実装の変更を容易にする:** パッケージの内部的な処理（非公開の関数や変数）を変更しても、それが外部（パッケージの利用者）に影響を与えにくくなります。公開されているインターフェース（エクスポートされた関数など）が変わらなければ、利用者は内部の変更を気にする必要がありません。
*   **APIをシンプルに保つ:** パッケージの利用者に、知る必要のない内部的な詳細を見せないことで、パッケージの使い方を分かりやすくします。
*   **意図しない使われ方を防ぐ:** 内部で使うためだけに設計された要素を、外部から誤って使われることを防ぎます。

## コード例 (再掲)

`110_exported-identifiers-camelcase.md` で使った `greeting` パッケージの例をもう一度見てみましょう。

```go title="greeting/greeting.go: 非公開要素を含むパッケージ"
package greeting

// エクスポートされる定数
const DefaultPrefix = "Hello, "

// ★ エクスポートされない定数 (小文字始まり)
const defaultSuffix = "!"

// エクスポートされる関数
func Say(name string) string {
	// ★ パッケージ内の非公開関数 formatMessage を呼び出す
	return formatMessage(name)
}

// ★ エクスポートされない関数 (小文字始まり)
// パッケージ内部でのみ使用されるヘルパー関数
func formatMessage(name string) string {
	// パッケージ内の公開定数と非公開定数を使用
	return DefaultPrefix + name + defaultSuffix
}

// エクスポートされる型
type Message struct {
	Text string
	// ★ エクスポートされないフィールド (小文字始まり)
	priority int
}

// エクスポートされる変数
var DefaultMessage = Message{Text: "Default Greeting", priority: 0}
```

```go title="main.go: greeting パッケージを利用する"
package main

import (
	"fmt"
	"myapp/greeting"
)

func main() {
	// 公開されている Say 関数は呼び出せる
	message := greeting.Say("Gopher")
	fmt.Println(message)

	// 非公開の defaultSuffix や formatMessage は呼び出せない
	// fmt.Println(greeting.defaultSuffix) // コンパイルエラー
	// greeting.formatMessage("Test")      // コンパイルエラー

	// 非公開の priority フィールドにもアクセスできない
	// fmt.Println(greeting.DefaultMessage.priority) // コンパイルエラー
}
```

**ポイント:**

*   `greeting` パッケージ内の `defaultSuffix`, `formatMessage`, `priority` は小文字で始まっているため、`greeting` パッケージの**内部**（例えば `Say` 関数の中）では自由に使えます。
*   しかし、`main` パッケージのような**外部**からは、これらの非公開要素にアクセスすることはできません。

このように、大文字始まり（公開）と小文字始まり（非公開）を使い分けることで、パッケージの構造を整理し、安全で使いやすいコードを書くことができます。