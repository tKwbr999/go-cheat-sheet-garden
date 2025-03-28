---
title: "パッケージ: ドキュメンテーションコメント"
tags: ["packages", "package", "ドキュメント", "コメント", "godoc"]
---

Go言語では、コードに対する**ドキュメンテーション（説明文）**をコメントとして記述することが強く推奨されています。適切に書かれたドキュメンテーションコメントは、`godoc` コマンドやオンラインの `pkg.go.dev` サービスによって自動的に整形され、パッケージの利用者が使い方を理解するのに役立ちます。

## パッケージコメント

パッケージ全体に関する説明は、**`package` 宣言の直前**にコメントとして記述します。このコメントは、そのパッケージの概要、目的、使い方などを説明するために使われます。

*   コメントは `//` で始めます。
*   `package` 宣言の直前に、空行を挟まずに記述します。
*   通常、`Package パッケージ名 ...` の形式で書き始めます。

```go title="mypackage/mypackage.go"
// Package mypackage は、文字列操作に関する便利なユーティリティを提供します。
// このパッケージを使うことで、文字列の逆順変換や文字数カウントなどが簡単に行えます。
//
// 例:
//   reversed := mypackage.Reverse("hello") // reversed は "olleh" になる
package mypackage

// ... パッケージの内容 ...
```

## エクスポートされる識別子へのコメント

パッケージから**エクスポートされる（大文字で始まる）**すべてのトップレベルの識別子（変数、定数、関数、型、メソッド）には、その**識別子の直前**にドキュメンテーションコメントを記述すべきです。

*   コメントはその識別子が何であるか、何をするのかを説明します。
*   関数やメソッドの場合は、引数や戻り値の意味、特別な動作や注意点なども記述します。
*   通常、識別子名で始まる文章で記述します（例: `// Add は 2 つの整数の和を返します。`）。

```go title="mypackage/mypackage.go (続き)"
package mypackage

import "unicode/utf8"

// --- 定数 ---

// DefaultSeparator はデフォルトの区切り文字を表します。
const DefaultSeparator = ","

// --- 変数 ---

// ErrorCount は処理中に発生したエラーの数を記録します (注意: パッケージ変数の使用は慎重に)。
var ErrorCount int

// --- 型 ---

// Processor は文字列を処理するインターフェースです。
type Processor interface {
	Process(s string) (string, error)
}

// --- 関数 ---

// Reverse は与えられた文字列を逆順にして返します。
// マルチバイト文字 (UTF-8) にも対応しています。
func Reverse(s string) string {
	runes := []rune(s)
	// utf8.RuneCountInString を使う方法もあるが、ここではスライスを使う例
	n := len(runes)
	for i := 0; i < n/2; i++ {
		runes[i], runes[n-1-i] = runes[n-1-i], runes[i]
	}
	return string(runes)
}

// CountRunes は文字列の文字数 (Rune の数) を返します。
func CountRunes(s string) int {
	// パッケージ内部の非公開関数を呼び出す
	return countRunesInternal(s)
}

// --- 非公開要素 ---
// 小文字で始まる非公開要素には、通常ドキュメンテーションコメントは必須ではありませんが、
// 複雑な内部ロジックを説明するためにコメントを付けることは有効です。

// countRunesInternal は文字数を数える内部関数
func countRunesInternal(s string) int {
	return utf8.RuneCountInString(s)
}
```

## ドキュメントの生成と表示

このように書かれたドキュメンテーションコメントは、以下の方法で整形されたドキュメントとして表示できます。

*   **`godoc` コマンド:**
    *   ローカル環境でドキュメントサーバーを起動: `godoc -http=:6060` (ブラウザで `http://localhost:6060/pkg/` にアクセス)
    *   コマンドラインで表示: `godoc myproject/mypackage` や `godoc myproject/mypackage Reverse`
*   **`go doc` コマンド:**
    *   コマンドラインで表示: `go doc myproject/mypackage` や `go doc myproject/mypackage.Reverse`
*   **`pkg.go.dev`:** パブリックなリポジトリであれば、`pkg.go.dev/github.com/youruser/yourrepo/mypackage` のようなURLでオンラインドキュメントが自動生成されます。

良いドキュメンテーションは、コードの品質を高め、他の開発者（や未来の自分）がコードを理解し、正しく使うために不可欠です。特に公開するパッケージでは、エクスポートされるすべての要素に分かりやすいドキュメンテーションコメントを記述するように心がけましょう。