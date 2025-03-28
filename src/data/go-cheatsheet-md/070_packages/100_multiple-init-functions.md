---
title: "パッケージ: 複数の `init()` 関数"
tags: ["packages", "package", "init", "初期化", "実行順序"]
---

Go言語では、1つのパッケージ内に**複数の `init()` 関数**を定義することができます。これは、同じファイル内に複数書くことも、パッケージを構成する複数の異なるファイルにそれぞれ `init()` 関数を記述することも可能です。

## 複数の `init()` 関数の実行

パッケージが初期化される際、そのパッケージ内に定義されている**すべての `init()` 関数が実行されます**。

**重要な注意点:** 同じパッケージ内に複数の `init()` 関数が存在する場合、それらが**どの順序で実行されるかは保証されません**。Goの言語仕様では、ファイル名や定義順に依存しない、とされています。ビルドごとに実行順序が変わる可能性もあります。

したがって、**複数の `init()` 関数の実行順序に依存するようなコードを書くべきではありません**。もし初期化処理に順序関係が必要な場合は、一つの `init()` 関数内で順番に処理を記述するか、明示的な初期化関数を別途用意して呼び出す順序を制御する必要があります。

## コード例

例として、同じパッケージ (`mypkg`) 内の異なるファイルに `init()` 関数を定義してみます。

**`mypkg/a.go`:**
```go
package mypkg

import "fmt"

func init() {
	fmt.Println("mypkg/a.go: init() 実行")
}

func FuncA() {
	fmt.Println("mypkg/a.go: FuncA() 実行")
}
```

**`mypkg/b.go`:**
```go
package mypkg // a.go と同じパッケージ

import "fmt"

var VarB = initializeVarB()

func initializeVarB() string {
	fmt.Println("mypkg/b.go: 変数 VarB 初期化中...")
	return "VarB"
}

func init() {
	fmt.Println("mypkg/b.go: init() 実行")
}

func FuncB() {
	fmt.Println("mypkg/b.go: FuncB() 実行")
}
```

**`main.go`:**
```go
package main

import (
	"fmt"
	"myproject/mypkg" // mypkg パッケージをインポート (パスは例)
)

func init() {
	fmt.Println("main.go: init() 実行")
}

func main() {
	fmt.Println("main() 開始")
	mypkg.FuncA()
	mypkg.FuncB()
	fmt.Println("main() 終了")
}

/* 実行結果の例 (mypkg 内の init の順序は不定):
mypkg/b.go: 変数 VarB 初期化中...
mypkg/a.go: init() 実行
mypkg/b.go: init() 実行
main.go: init() 実行
main() 開始
mypkg/a.go: FuncA() 実行
mypkg/b.go: FuncB() 実行
main() 終了
*/

/* 別の実行結果の例 (mypkg 内の init の順序が変わる可能性):
mypkg/b.go: 変数 VarB 初期化中...
mypkg/b.go: init() 実行
mypkg/a.go: init() 実行
main.go: init() 実行
main() 開始
mypkg/a.go: FuncA() 実行
mypkg/b.go: FuncB() 実行
main() 終了
*/
```

**コード解説:**

*   `mypkg` パッケージは `a.go` と `b.go` の2つのファイルから構成され、それぞれに `init()` 関数が定義されています。
*   `main` パッケージが `mypkg` をインポートすると、`main` 関数の実行前に `mypkg` の初期化が行われます。
*   まず `mypkg` のパッケージ変数 (`VarB`) が初期化されます。
*   次に `mypkg` 内の**両方の `init()` 関数**が実行されますが、`a.go` の `init()` と `b.go` の `init()` のどちらが先に実行されるかは**保証されません**。実行結果の例で示したように、順序は変わる可能性があります。
*   `mypkg` の初期化が終わった後、`main` パッケージの `init()` が実行され、最後に `main()` 関数が実行されます。

## まとめ

*   1つのパッケージに複数の `init()` 関数を定義できます（複数のファイルに分けても可）。
*   パッケージ初期化時に、そのパッケージ内のすべての `init()` 関数が実行されます。
*   **同じパッケージ内の `init()` 関数の実行順序は保証されません。** 実行順序に依存するコードは書かないでください。

初期化処理を複数の `init()` 関数に分割することは可能ですが、順序依存の問題を避けるために、通常は一つの `init()` 関数にまとめるか、明示的な初期化関数を使う方が安全で分かりやすい場合が多いです。