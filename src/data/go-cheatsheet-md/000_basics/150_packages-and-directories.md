## タイトル
title: パッケージとディレクトリ構造: コードの置き場所

## タグ
tags: ["basics", "パッケージ", "ディレクトリ", "import"]

## コード
```go
package main

import (
	"fmt"
	// calculator パッケージをインポート
	// パスは "モジュールパス/ディレクトリパス"
	"myproject/calculator" // "myproject" は go.mod の module 名 (例)
)

func main() {
	// パッケージ名を使って関数を呼び出す
	sum := calculator.Add(5, 3)
	diff := calculator.Subtract(5, 3)

	fmt.Println("Sum:", sum)
	fmt.Println("Difference:", diff)
}

// --- calculator/calculator.go (別ファイル) ---
/*
package calculator // ディレクトリ名と同じパッケージ名

func Add(a, b int) int { return a + b }
func Subtract(a, b int) int { return a - b }
*/
```

## 解説
```text
Goのコードは**パッケージ**で整理され、通常、**ディレクトリ**構造と関連します。

**1ディレクトリ = 1パッケージ の原則:**
原則として、一つのディレクトリ内の全 `.go` ファイルは同じパッケージに属します (同じ `package` 宣言を持つ)。(テストファイル `_test.go` は例外あり)

**`main` パッケージ:**
プログラム実行開始点 (`main` 関数) を含む特別なパッケージ。ディレクトリ名は `main` でなくても良い。

**ディレクトリ構造と `import` パス:**
他のパッケージを利用する際は `import` でパスを指定します。
Go Modules では、パスは通常 `go.mod` の**モジュールパス**に、パッケージが含まれる**ディレクトリパス**を `/` で繋げて指定します。
例: モジュールパスが `myproject` で、`calculator` ディレクトリ内のパッケージを使う場合 -> `import "myproject/calculator"`

インポートしたパッケージ内のエクスポートされた要素 (大文字始まり) は、`パッケージ名.要素名` (例: `calculator.Add`) で利用します。

適切なディレクトリ構造とパッケージ宣言が、整理されたコードの基本です。