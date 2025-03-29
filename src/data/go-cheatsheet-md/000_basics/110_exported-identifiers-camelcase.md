## タイトル
title: エクスポートされる識別子: パッケージの外から使える名前

## タグ
tags: ["basics", "パッケージ", "命名規則", "エクスポート", "公開", "キャメルケース"]

## コード
```go
// greeting パッケージ
package greeting

// エクスポートされる定数 (大文字始まり)
const DefaultPrefix = "Hello, "

// エクスポートされない定数 (小文字始まり)
const defaultSuffix = "!"

// エクスポートされる関数 (大文字始まり)
func Say(name string) string {
	return formatMessage(name) // 内部で非公開関数を呼ぶ
}

// エクスポートされない関数 (小文字始まり)
func formatMessage(name string) string {
	return DefaultPrefix + name + defaultSuffix
}

// エクスポートされる型とフィールド
// type Message struct {
//     PublicField string
//     privateField int // 非公開フィールド
// }

```

## 解説
```text
Goでは、パッケージ内で定義した要素（変数、定数、関数、型など）のうち、他のパッケージから利用可能にするものを**エクスポート**（公開）します。

**識別子**とは要素に付ける「名前」のことです。

**Goのエクスポートルール:**
識別子の**最初の文字が大文字かどうか**で決まります。
*   **大文字始まり:** 他のパッケージからアクセス**可能**。
*   **小文字始まり:** 定義されたパッケージ内からのみアクセス**可能**。

**命名規則: キャメルケース (CamelCase)**
Goでは識別子にキャメルケースを使います。
*   **エクスポート (公開):** アッパーキャメルケース (例: `MyVariable`, `CalculateTotal`)。
*   **非エクスポート (非公開):** ローワーキャメルケース (例: `myVariable`, `calculateSubtotal`)。

コード例の `greeting` パッケージでは:
*   `DefaultPrefix` と `Say` は大文字始まりなのでエクスポートされます。
*   `defaultSuffix` と `formatMessage` は小文字始まりなのでエクスポートされません。

別のパッケージから `import "greeting"` した場合、`greeting.Say()` や `greeting.DefaultPrefix` は使えますが、`greeting.formatMessage()` や `greeting.defaultSuffix` はコンパイルエラーになります。

型 (`type MyType struct`) や構造体のフィールドも同様で、大文字始まりのフィールドのみがパッケージ外からアクセス可能です。

このルールにより、パッケージの内部実装を隠蔽し、外部に公開するインターフェースを明確に定義できます。