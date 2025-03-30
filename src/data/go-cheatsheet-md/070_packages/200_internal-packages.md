## タイトル
title: `internal` パッケージによる内部実装の隠蔽

## タグ
tags: ["packages", "package", "internal", "可視性", "カプセル化", "依存関係"]

## コード
```go
// --- internal/config/config.go ---
package config

// internal 以下にあるパッケージ

// Load は設定をロードする (エクスポートされている)
func Load() string {
	return "Loaded Config from internal/config"
}

// --- cmd/myapp/main.go (internal の親のサブツリー内) ---
package main

import (
	"example.com/myproject/internal/config" // OK: インポート可
	"fmt"
)

func main() {
	cfg := config.Load() // internal の関数を呼び出し
	fmt.Println(cfg)
}

// --- anotherproject/main.go (外部プロジェクト) ---
/*
package main

import (
	"fmt"
	// "example.com/myproject/internal/config" // コンパイルエラー!
)

func main() {
	// cfg := config.Load() // エラー
	fmt.Println("Cannot import internal package")
}
// エラー例: use of internal package example.com/myproject/internal/config not allowed
*/
```

## 解説
```text
Go 1.4 から導入された **`internal`** ディレクトリは、
パッケージの可視性を制御する特別な仕組みです。
`internal` 以下に置かれたパッケージはインポート可能な範囲が
コンパイラによって制限されます。

**ルール:**
`internal` ディレクトリ、またはそのサブディレクトリ内のパッケージは、
その `internal` ディレクトリの**直上の親ディレクトリ**を
ルートとするサブツリー内のコードから**のみ**インポートできます。
それ以外の場所（別のプロジェクトや、親の外のディレクトリ）からは
インポートできず、コンパイルエラーになります。

**例:**
```
myproject/
├── go.mod (module example.com/myproject)
├── cmd/myapp/main.go       (OK: internal をインポート可)
├── internal/config/config.go (ここに定義)
└── pkg/api/server.go       (OK: internal をインポート可)
anotherproject/
└── main.go                 (NG: internal をインポート不可)
```

**なぜ使うか？**
*   **内部実装の強制隠蔽:** パッケージ外部から利用されることを
    コンパイラレベルで禁止できる。
*   **公開APIの明確化:** 公開API (`pkg/` 等) と内部実装 (`internal/`) を
    明確に分離できる。
*   **リファクタリング容易化:** 外部から使われていないことが保証されるため、
    後方互換性を気にせず内部コードを変更しやすくなる。

コード例では、`cmd/myapp/main.go` は `internal/config` を
インポートできますが、`anotherproject/main.go` はできません。

`internal` はプロジェクト内部構造を整理し、公開APIと内部実装を
明確に分離するための強力なツールです。