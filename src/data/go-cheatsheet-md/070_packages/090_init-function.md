---
title: "パッケージ: 初期化関数 `init()`"
tags: ["packages", "package", "init", "初期化", "副作用"]
---

Go言語には、**`init()`** という特別な名前を持つ関数があります。この関数は、パッケージがプログラムに読み込まれる際に**自動的に実行**され、主にパッケージの**初期化処理**を行うために使われます。

## `init()` 関数の特徴

*   **特別な名前:** 関数名は必ず `init` でなければなりません。
*   **引数・戻り値なし:** `init` 関数は引数を受け取らず、戻り値も返しません (`func init()`)。
*   **自動実行:** プログラムの実行開始時、`main` 関数が実行される**前**に、インポートされているすべてのパッケージの `init` 関数が実行されます。
*   **実行順序:**
    1.  まず、インポートされているパッケージのパッケージ変数が初期化されます。
    2.  次に、インポートされているパッケージの `init` 関数が実行されます（インポートの依存関係の逆順で実行されることが多いですが、厳密な順序に依存すべきではありません）。
    3.  最後に、`main` パッケージのパッケージ変数が初期化され、`main` パッケージの `init` 関数が実行され、そして `main` 関数が実行されます。
*   **複数定義可能:** 1つのパッケージ内に複数の `init` 関数を定義できます（または、同じパッケージ内の複数のファイルに `init` 関数を定義できます）。その場合、同じパッケージ内の `init` 関数がどの順序で実行されるかは保証されません。
*   **明示的な呼び出し不可:** `init` 関数をコード内から直接呼び出すことはできません。

## `init()` 関数の主な用途

*   **パッケージ変数の初期化:** パッケージ変数の初期化が単純な代入だけでは不十分で、より複雑な計算や設定が必要な場合に使われます。
*   **状態のセットアップ:** パッケージが機能するために必要な内部状態（例: 設定の読み込み、キャッシュの準備）を準備します。
*   **副作用のための登録:** ブランクインポート (`import _ "..."`) のセクションで見たように、データベースドライバや画像フォーマットなどを、それらを管理する別のパッケージに登録するために使われます。

## コード例

```go title="init 関数の実行順序"
// --- パッケージ a ---
package a

import "fmt"

var VarA = "Variable A initialized"

func init() {
	fmt.Println("Package a: init() executed")
	VarA = "Variable A modified in init" // パッケージ変数を init で変更
}

func FuncA() {
	fmt.Println("Package a: FuncA() called")
}

// --- パッケージ b (パッケージ a に依存) ---
package b

import (
	"fmt"
	"myproject/a" // パッケージ a をインポート (パスは例)
)

var VarB = initializeVarB() // 関数呼び出しで初期化

func initializeVarB() string {
	fmt.Println("Package b: Initializing VarB...")
	a.FuncA() // インポートしたパッケージの関数を呼び出せる
	return "Variable B initialized"
}

func init() {
	fmt.Println("Package b: init() executed")
}

// --- main パッケージ (パッケージ b に依存) ---
package main

import (
	"fmt"
	"myproject/a" // パッケージ a をインポート
	"myproject/b" // パッケージ b をインポート
)

var VarMain = "Variable Main initialized"

func init() {
	fmt.Println("Package main: init() executed")
}

func main() {
	fmt.Println("--- main() started ---")
	fmt.Println("main: Accessing VarA:", a.VarA)
	fmt.Println("main: Accessing VarB:", b.VarB) // VarB は既に初期化されている
	fmt.Println("main: Accessing VarMain:", VarMain)
	fmt.Println("--- main() finished ---")
}

/* 実行結果 (おおよその順序):
Package a: init() executed                 <- a の init が先に実行される
Package b: Initializing VarB...            <- b の変数初期化 (a の関数呼び出し可能)
Package a: FuncA() called
Package b: init() executed                 <- b の init が実行される
Package main: init() executed              <- main の init が実行される
--- main() started ---                     <- main() が開始される
main: Accessing VarA: Variable A modified in init
main: Accessing VarB: Variable B initialized
main: Accessing VarMain: Variable Main initialized
--- main() finished ---
*/
```

**コード解説:**

1.  プログラムが開始されると、まずインポートされているパッケージ (`a`, `b`) の初期化が始まります。
2.  `b` は `a` に依存しているので、先に `a` が初期化されます。
    *   `a` のパッケージ変数 `VarA` が初期化されます (`"Variable A initialized"`)。
    *   `a` の `init()` が実行され、`VarA` が変更され、メッセージが出力されます。
3.  次に `b` が初期化されます。
    *   `b` のパッケージ変数 `VarB` が `initializeVarB()` の呼び出しによって初期化されます。この関数内では、既に初期化済みの `a` パッケージの関数 `a.FuncA()` を呼び出すことができます。
    *   `b` の `init()` が実行され、メッセージが出力されます。
4.  最後に `main` パッケージが初期化されます。
    *   `main` のパッケージ変数 `VarMain` が初期化されます。
    *   `main` の `init()` が実行されます。
5.  すべての初期化が終わった後、`main` 関数が実行されます。

## 注意点

*   **実行順序への依存:** 同じパッケージ内に複数の `init` 関数がある場合や、複雑なインポート依存関係がある場合、`init` 関数の正確な実行順序に依存するコードを書くのは避けるべきです。順序は Go のバージョンやビルド方法によって変わる可能性があります。
*   **エラーハンドリング:** `init` 関数はエラーを返すことができません。`init` 内でエラーが発生する可能性がある処理を行う場合は、`panic` を使うか、あるいは初期化失敗を示すパッケージ変数（フラグなど）を設定し、他の関数でその状態をチェックするなどの方法が必要になります。
*   **複雑さの増加:** `init` 関数を多用すると、プログラムの起動シーケンスが複雑になり、理解やデバッグが難しくなることがあります。可能な限り、明示的な初期化関数（例: `New...()`）を用意し、必要なタイミングで呼び出す方が良い場合が多いです。

`init` 関数は、パッケージの初期化や副作用の登録に便利な機能ですが、その特性と注意点を理解した上で、適切に利用することが重要です。