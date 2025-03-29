## タイトル
title: パッケージ: ドキュメンテーションコメント

## タグ
tags: ["packages", "package", "ドキュメント", "コメント", "godoc"]

## コード
```go
// Package mypackage は、文字列操作ユーティリティを提供します。(パッケージコメント例)
package mypackage

import (
	"fmt"
	"unicode/utf8"
)

// DefaultSeparator はデフォルトの区切り文字を表します。
const DefaultSeparator = ","

// ErrorCount は処理中に発生したエラーの数を記録します。
var ErrorCount int

// Processor は文字列を処理するインターフェースです。
type Processor interface {
	Process(s string) (string, error)
}

// Reverse は与えられた文字列を逆順にして返します。
// マルチバイト文字にも対応しています。
func Reverse(s string) string {
	runes := []rune(s)
	n := len(runes)
	for i := 0; i < n/2; i++ {
		runes[i], runes[n-1-i] = runes[n-1-i], runes[i]
	}
	return string(runes)
}

// CountRunes は文字列の文字数 (Rune の数) を返します。
func CountRunes(s string) int {
	return countRunesInternal(s) // 非公開関数を呼ぶ
}

// countRunesInternal は非公開関数 (コメントは必須ではない)
func countRunesInternal(s string) int {
	return utf8.RuneCountInString(s)
}

```

## 解説
```text
Goではコードに**ドキュメンテーションコメント**を記述することが
強く推奨されます。`godoc` コマンド等で整形され、
パッケージ利用者の助けになります。

**パッケージコメント:**
パッケージ全体の概要説明。
**`package` 宣言の直前**に `//` で記述します。
通常 `// Package パッケージ名 ...` で始めます。
```go
// Package mypkg は ... を行います。
package mypkg
```

**エクスポートされる識別子へのコメント:**
**公開する** (大文字始まり) すべてのトップレベル識別子
(変数, 定数, 関数, 型, メソッド) には、
その**識別子の直前**にコメントを記述すべきです。
*   何であるか、何をするかを説明。
*   関数/メソッドは引数、戻り値、注意点も。
*   通常、識別子名で始まる文章で記述。
    (例: `// Add は2つの和を返す。`)

コード例では `DefaultSeparator`, `ErrorCount`, `Processor`,
`Reverse`, `CountRunes` にドキュメンテーションコメントが付いています。

**非公開要素へのコメント:**
小文字で始まる非公開要素には必須ではありませんが、
複雑な内部ロジックの説明に有効です。

**ドキュメントの生成・表示:**
*   `godoc -http=:6060`: ローカルでドキュメントサーバー起動。
*   `go doc <パッケージパス>`: コマンドラインで表示。
*   `pkg.go.dev/<パッケージパス>`: 公開リポジトリならオンラインで表示。

良いドキュメンテーションはコード品質を高めます。
特に公開パッケージでは必須と考えましょう。