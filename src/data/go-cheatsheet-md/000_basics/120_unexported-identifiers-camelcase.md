## タイトル
title: エクスポートされない識別子: パッケージ内部の名前

## タグ
tags: ["basics", "パッケージ", "命名規則", "非公開", "キャメルケース"]

## コード
```go
package greeting

// エクスポートされる定数 (比較用)
const DefaultPrefix = "Hello, "

// エクスポートされない定数 (小文字始まり)
const defaultSuffix = "!"

// エクスポートされる関数 (比較用)
func Say(name string) string {
	return formatMessage(name) // 内部で非公開関数を呼ぶ
}

// エクスポートされない関数 (小文字始まり)
func formatMessage(name string) string {
	return DefaultPrefix + name + defaultSuffix
}

// エクスポートされる型 (比較用)
type Message struct {
	PublicText string
	// エクスポートされないフィールド (小文字始まり)
	priority int
}

```

## 解説
```text
パッケージ内部だけで使い、外部に公開したくない要素は、
**エクスポートされない（非公開）**識別子として定義します。

**Goの非公開ルール:**
識別子の**最初の文字が小文字かどうか**で決まります。
*   **小文字始まり:** パッケージ内からのみアクセス可能。
*   **大文字始まり:** 他のパッケージからもアクセス可能。

**命名規則: ローワーキャメルケース**
非公開の識別子には、**ローワーキャメルケース**
(例: `internalCounter`, `calculatePrice`) を使うのが一般的です。
コード例の `defaultSuffix`, `formatMessage`, `priority` が該当します。

**なぜ非公開にするのか？ (カプセル化)**
*   **実装変更の容易化:** 内部処理を変更しても、公開インターフェースが
    変わらなければ外部への影響を抑えられる。
*   **APIの簡潔化:** 利用者に不要な内部詳細を見せず、使い方を分かりやすくする。
*   **意図しない利用の防止:** 内部利用のみを想定した要素の誤用を防ぐ。

コード例の `defaultSuffix`, `formatMessage`, `priority` は
小文字始まりのため、パッケージ**内部** (`Say` 関数など) では使えますが、
パッケージ**外部** (例: `main` パッケージ) からアクセスしようとすると
コンパイルエラーになります。

公開 (大文字) と非公開 (小文字) を使い分け、パッケージ構造を整理し、
安全で使いやすいコードを目指しましょう。