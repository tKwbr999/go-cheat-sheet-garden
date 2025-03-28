---
title: "パッケージとディレクトリ構造: コードの置き場所"
tags: ["basics", "パッケージ", "ディレクトリ", "import"]
---

Goのコードは**パッケージ**という単位で整理されます。そして、これらのパッケージは通常、コンピュータ上の**ディレクトリ（フォルダ）**構造と密接に関連しています。

## 1ディレクトリ = 1パッケージ の原則

Goでは、原則として**一つのディレクトリに含まれるすべての `.go` ファイルは、同じパッケージに属している**必要があります。つまり、同じディレクトリ内のすべての `.go` ファイルは、ファイルの先頭で同じ `package` 宣言（例: `package main`, `package myutils`）を持たなければなりません。

**例外:** テストコード（`_test.go` で終わるファイル）は、同じディレクトリにあっても、テスト対象のパッケージとは別のパッケージ（通常は `パッケージ名_test`）に属することができます。

## `main` パッケージの特別扱い

`package main` は特別なパッケージです。このパッケージには、プログラムの実行を開始するための `main` 関数が含まれている必要があります。`go build` コマンドなどで実行可能ファイルを生成する際の起点となります。

`main` パッケージのソースコードが含まれるディレクトリ名は、必ずしも `main` である必要はありません。プロジェクトのルートディレクトリや、`cmd/myprogram/` のようなディレクトリに置かれることが一般的です。

## ディレクトリ構造と `import` パス

他のパッケージを利用（インポート）する際には、`import` 文でそのパッケージへのパスを指定します。このパスは通常、Goのワークスペース（`GOPATH` 環境変数で設定される場所、または Go Modules を使っている場合はモジュールのルート）からの相対パスに基づいています。

**例: 簡単なプロジェクト構造**

```
myproject/
├── go.mod                # Go Modules の設定ファイル (モジュールパス: mycompany.com/myproject)
├── main.go               # package main
└── calculator/           # calculator パッケージのディレクトリ
    ├── add.go            # package calculator
    └── subtract.go       # package calculator
```

*   `myproject` がプロジェクトのルートディレクトリです。
*   `go.mod` ファイルで、このプロジェクト（モジュール）の基準となるパスが `mycompany.com/myproject` と定義されているとします。
*   `main.go` は `package main` で、プログラムのエントリーポイントです。
*   `calculator` ディレクトリ内の `add.go` と `subtract.go` は、どちらも `package calculator` と宣言されている必要があります。

**`main.go` から `calculator` パッケージを利用する場合:**

```go title="main.go"
package main

import (
	"fmt"
	// calculator パッケージをインポート
	// パスは モジュールパス + ディレクトリ名 で指定
	"mycompany.com/myproject/calculator"
)

func main() {
	sum := calculator.Add(5, 3)       // calculator パッケージの Add 関数を呼び出す
	diff := calculator.Subtract(5, 3) // calculator パッケージの Subtract 関数を呼び出す

	fmt.Println("合計:", sum)
	fmt.Println("差分:", diff)
}
```

```go title="calculator/add.go"
package calculator // ディレクトリ名と同じパッケージ名

// Add 関数 (大文字始まりなのでエクスポートされる)
func Add(a, b int) int {
	return a + b
}
```

```go title="calculator/subtract.go"
package calculator // ディレクトリ名と同じパッケージ名

// Subtract 関数 (大文字始まりなのでエクスポートされる)
func Subtract(a, b int) int {
	return a - b
}
```

**ポイント:**

*   `import` 文では、モジュールパス (`mycompany.com/myproject`) に続けて、パッケージが含まれるディレクトリ名 (`calculator`) をスラッシュ `/` で繋げて指定します (`"mycompany.com/myproject/calculator"`)。
*   インポートしたパッケージ内のエクスポートされた要素（大文字始まりの関数 `Add`, `Subtract` など）は、`パッケージ名.要素名`（例: `calculator.Add`）のようにして利用します。
*   `calculator` ディレクトリ内の `.go` ファイルはすべて `package calculator` と宣言されている必要があります。

このように、ディレクトリ構造とパッケージ宣言を適切に管理することが、Goで整理されたコードを書くための基本となります。