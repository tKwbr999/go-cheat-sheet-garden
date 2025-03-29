## タイトル
title: パッケージ: 複数の `init()` 関数

## タグ
tags: ["packages", "package", "init", "初期化", "実行順序"]

## コード
```go
// --- パッケージ mypkg (例: mypkg/a.go) ---
package mypkg
import "fmt"
func init() { fmt.Println("mypkg/a.go: init()") }
func FuncA() { fmt.Println("mypkg/a.go: FuncA()") }

// --- パッケージ mypkg (例: mypkg/b.go) ---
// (同じパッケージ内に別のファイル)
package mypkg
import "fmt"
var VarB = initializeVarB() // 変数初期化は init より先
func initializeVarB() string { fmt.Println("mypkg/b.go: VarB init"); return "VarB" }
func init() { fmt.Println("mypkg/b.go: init()") }
func FuncB() { fmt.Println("mypkg/b.go: FuncB()") }

// --- main パッケージ (例: main.go) ---
package main
import (
	"fmt"
	"myproject/mypkg" // パスは例
)
func main() {
	fmt.Println("main() 開始")
	mypkg.FuncA()
	mypkg.FuncB()
	fmt.Println("main() 終了")
}

/* 実行結果例 (mypkg 内の init 順序は不定):
mypkg/b.go: VarB init
mypkg/a.go: init()
mypkg/b.go: init()
main() 開始
mypkg/a.go: FuncA()
mypkg/b.go: FuncB()
main() 終了
*/
```

## 解説
```text
Goでは、1つのパッケージ内に**複数の `init()` 関数**を
定義できます。同じファイルに複数書くことも、
パッケージ内の別々のファイルに書くことも可能です。

**実行:**
パッケージ初期化時、そのパッケージ内の**すべての `init()` 関数**が
実行されます (パッケージ変数初期化の後、`main` より前)。

**重要: 実行順序は保証されない**
同じパッケージ内に複数の `init()` 関数がある場合、
それらが**どの順序で実行されるかは保証されません**。
ファイル名や定義順に依存せず、ビルドごとに変わる可能性もあります。

**したがって、複数の `init()` 関数の実行順序に
依存するコードを書くべきではありません。**

コード例では `mypkg` パッケージの `a.go` と `b.go` に
それぞれ `init()` があります。`main` が `mypkg` を
インポートすると、まず `VarB` が初期化され、
次に `a.go` と `b.go` の両方の `init()` が実行されますが、
どちらの `init()` が先かは不定です。その後 `main()` が実行されます。

**推奨:**
初期化処理に順序が必要な場合は、
*   一つの `init()` 関数内で順番に処理を記述する。
*   明示的な初期化関数 (`Initialize()` など) を用意し、
    呼び出し側で順序を制御する。
方が安全で分かりやすくなります。

複数の `init()` は可能ですが、順序不定性を理解し、
依存しないように注意しましょう。