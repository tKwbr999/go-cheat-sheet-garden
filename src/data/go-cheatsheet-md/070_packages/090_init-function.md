## タイトル
title: 初期化関数 `init()`

## タグ
tags: ["packages", "package", "init", "初期化", "副作用"]

## コード
```go
// --- パッケージ a (例: a/a.go) ---
package a

import "fmt"

var VarA = "Var A initialized"

func init() {
	fmt.Println("Package a: init()")
	VarA = "Var A modified in init"
}
func FuncA() { fmt.Println("Package a: FuncA()") }

// --- main パッケージ (例: main.go) ---
package main

import (
	"fmt"
	"myproject/a" // パスは例
)

var VarMain = "Var Main initialized"

func init() {
	fmt.Println("Package main: init()")
}

func main() {
	fmt.Println("--- main() started ---")
	fmt.Println("main: VarA:", a.VarA) // a の init() 実行後の値
	a.FuncA()
	fmt.Println("main: VarMain:", VarMain)
	fmt.Println("--- main() finished ---")
}

/* 実行結果 (おおよその順序):
Package a: init()
Package main: init()
--- main() started ---
main: VarA: Var A modified in init
Package a: FuncA()
main: VarMain: Var Main initialized
--- main() finished ---
*/
```

## 解説
```text
Goには **`init()`** という特別な関数があり、
パッケージが読み込まれる際に**自動実行**され、
主にパッケージの**初期化処理**に使われます。

**`init()` 関数の特徴:**
*   **名前:** 必ず `init`。
*   **シグネチャ:** 引数・戻り値なし (`func init()`)。
*   **自動実行:** `main` 関数実行**前**に実行される。
*   **実行順序:**
    1. インポートされたパッケージの変数初期化。
    2. インポートされたパッケージの `init` 関数実行
       (依存関係の逆順が多いが、依存すべきでない)。
    3. `main` パッケージの変数初期化。
    4. `main` パッケージの `init` 関数実行。
    5. `main` 関数実行。
*   **複数定義:** 1パッケージ内に複数可 (実行順序不定)。
*   **呼び出し不可:** コードから直接呼び出せない。

コード例では、`main` が `a` をインポートしているため、
`a` の変数初期化 → `a` の `init()` → `main` の変数初期化 →
`main` の `init()` → `main()` の順で実行されます。

**主な用途:**
*   複雑なパッケージ変数の初期化。
*   パッケージが必要とする内部状態のセットアップ。
*   副作用のための登録 (DBドライバ、画像フォーマット等)。
    (ブランクインポート `import _ "..."` でよく使われる)

**注意点:**
*   **実行順序依存回避:** 複雑な依存関係や同一パッケージ内の
    複数 `init` の実行順序に依存しない設計を心がける。
*   **エラーハンドリング:** `init` は `error` を返せない。
    失敗時は `panic` するか、パッケージ変数等で状態を示す。
*   **複雑さ:** 多用すると起動シーケンスが複雑化しやすい。
    可能な限り明示的な初期化関数 (`New...`) を検討する。

`init` は便利ですが、特性と注意点を理解し適切に使いましょう。