---
title: "パッケージ: インポートパスと Go Modules"
tags: ["packages", "package", "import", "go modules", "モジュールパス", "相対パス"]
---

Goのパッケージを `import` する際に指定するパスは、プロジェクトの構成方法によって決まります。現在主流となっている **Go Modules** システムでは、インポートパスの指定方法にルールがあります。

## Go Modules とは？

Go Modules は、Go 1.11 から導入され、Go 1.16 以降でデフォルトで有効になった、Goの公式な依存関係管理システムです。プロジェクトのルートディレクトリに `go.mod` というファイルを作成し、そこでプロジェクト自身の**モジュールパス**と、依存する外部パッケージ（ライブラリ）の情報を管理します。

## Modules 環境でのインポートパス

Go Modules を使っているプロジェクトでは、パッケージをインポートする際のパスは、原則として `go.mod` ファイルで定義された**モジュールパス**からの**絶対パス**（または標準ライブラリのパス、外部モジュールのパス）で記述する必要があります。

**`./` や `../` で始まる相対パスによるインポートは、通常は許可されません。**

## コード例

以下のようなプロジェクト構造と `go.mod` ファイルがあるとします。

**ディレクトリ構造:**
```
myproject/
├── go.mod
├── main.go
└── internal/
    └── helper/
        └── helper.go
```

**`go.mod` ファイル:**
```
module mycompany.com/myproject // このプロジェクトのモジュールパス

go 1.20 // Goのバージョン
```

**`internal/helper/helper.go`:**
```go
package helper // パッケージ名はディレクトリ名と同じ

// エクスポートされる関数
func GetHelperMessage() string {
	return "Message from helper package"
}
```

**`main.go`:**
```go
package main

import (
	"fmt"
	// ★ 正しいインポートパス ★
	// モジュールパス "mycompany.com/myproject" からの相対パスで指定
	"mycompany.com/myproject/internal/helper"

	// --- 間違ったインポートパス (コンパイルエラーになる) ---
	// "./internal/helper" // 相対パスは使えない
	// "../myproject/internal/helper" // 相対パスは使えない
)

func main() {
	fmt.Println("Main program started.")

	// 正しくインポートされた helper パッケージの関数を呼び出す
	message := helper.GetHelperMessage()
	fmt.Println(message)
}

/* 実行結果:
Main program started.
Message from helper package
*/
```

**コード解説:**

*   `go.mod` ファイルで、このプロジェクトのモジュールパスが `mycompany.com/myproject` と定義されています。これがインポートパスの基準となります。
*   `main.go` から `internal/helper` ディレクトリにある `helper` パッケージをインポートするには、`import "mycompany.com/myproject/internal/helper"` と記述します。これは `モジュールパス + / + パッケージのディレクトリパス` という形式です。
*   `import "./internal/helper"` のような相対パスを使おうとすると、Go Modules 環境では通常コンパイルエラーになります (`relative import paths are not supported in module mode`)。

## なぜ相対パスが非推奨なのか？

相対パスによるインポートは、コードがどのディレクトリにあるかによってインポートの意味が変わってしまい、プロジェクト構造の変更に弱く、混乱を招きやすいため、Go Modules では非推奨とされています。モジュールパスからの絶対パスを使うことで、プロジェクト内のどこからでも同じパスでパッケージを参照でき、コードの場所への依存性が低くなります。

**まとめ:**

Go Modules を使っている場合は、`import` 文には `go.mod` で定義されたモジュールパスを基準とした絶対パス、標準ライブラリのパス、または外部モジュールのパスを使用し、`./` や `../` で始まる相対パスは使わないようにしましょう。