## タイトル
title: パッケージ: インポートパスと Go Modules

## タグ
tags: ["packages", "package", "import", "go modules", "モジュールパス", "相対パス"]

## コード
```go
package main

import (
	"fmt"
	// 正しいインポートパス (モジュールパスからの絶対パス)
	"mycompany.com/myproject/internal/helper"

	// 間違ったインポートパス (相対パスは不可)
	// "./internal/helper"
	// "../myproject/internal/helper"
)

func main() {
	fmt.Println("Main started.")
	message := helper.GetHelperMessage() // 正しくインポートされた関数を呼び出す
	fmt.Println(message)
}

// --- internal/helper/helper.go ---
// package helper
// func GetHelperMessage() string { return "Helper message" }

// --- go.mod ---
// module mycompany.com/myproject
// go 1.20
```

## 解説
```text
パッケージを `import` する際のパスは、
現在主流の **Go Modules** システムのルールに従います。

**Go Modules:**
Go 1.11から導入された公式の依存関係管理システム。
プロジェクトルートの `go.mod` ファイルで、
プロジェクト自身の**モジュールパス**と依存関係を管理します。
例: `module mycompany.com/myproject`

**Modules 環境でのインポートパス:**
原則として、`go.mod` で定義された**モジュールパス**からの
**絶対パス**で記述します。
標準ライブラリや外部モジュールも同様に絶対パスで指定します。

**相対パス (`./`, `../`) は非推奨:**
`./` や `../` で始まる相対パスによるインポートは、
Go Modules 環境では通常**許可されません** (コンパイルエラー)。

コード例では、モジュールパスが `mycompany.com/myproject` と
定義されている場合、`internal/helper` パッケージを
インポートするには、
`import "mycompany.com/myproject/internal/helper"`
と記述します (`モジュールパス + / + ディレクトリパス`)。
`import "./internal/helper"` はエラーになります。

**なぜ相対パス非推奨か？**
コードの場所によって意味が変わるため、プロジェクト構造の
変更に弱く、混乱を招きやすいためです。
モジュールパスからの絶対パスを使うことで、
プロジェクト内のどこからでも同じパスで参照でき、
コードの場所への依存性が低くなります。

**まとめ:** Go Modules 環境では、`import` には
モジュールパス基準の絶対パス等を使い、相対パスは避けましょう。