---
title: "パッケージ: `internal` パッケージによる内部実装の隠蔽"
tags: ["packages", "package", "internal", "可視性", "カプセル化", "依存関係"]
---

Go 1.4 から導入された **`internal`** ディレクトリは、パッケージの可視性を制御するための特別な仕組みです。`internal` ディレクトリ以下に置かれたパッケージは、Goのコンパイラによって**インポート可能な範囲が制限**されます。

## `internal` パッケージのルール

*   `internal` ディレクトリは、プロジェクト内の**どこにでも**作成できます（例: プロジェクトルート直下、`pkg/` ディレクトリの下など）。
*   `internal` ディレクトリ、またはそのサブディレクトリに含まれるパッケージは、その `internal` ディレクトリの**直上の親ディレクトリ**をルートとするサブツリー内のコードから**のみ**インポートできます。
*   それ以外の場所（例えば、全く別のプロジェクトや、同じプロジェクト内でも `internal` の親ディレクトリの外）からは、`internal` パッケージをインポートしようとすると**コンパイルエラー**になります。

## なぜ `internal` を使うのか？

*   **内部実装の強制的な隠蔽:** パッケージのエクスポートルール（大文字・小文字）は、パッケージの利用者が意図せずに内部実装の詳細に依存することを完全には防げません。`internal` ディレクトリを使うことで、特定のコードがプロジェクトの外部から利用されることを**コンパイラレベルで強制的に禁止**できます。
*   **公開APIの明確化:** プロジェクトの外部に公開したいAPI（`pkg/` ディレクトリなどに置かれることが多い）と、内部的な実装詳細（`internal/` 以下に置く）を明確に分離できます。
*   **リファクタリングの容易化:** `internal` パッケージ内のコードは外部から使われていないことが保証されるため、後方互換性を気にすることなく、より自由にリファクタリングを行うことができます。

## コード例

以下のようなディレクトリ構造を考えます。モジュールパスは `example.com/myproject` とします。

```
myproject/
├── go.mod
├── cmd/
│   └── myapp/
│       └── main.go       (package main)
├── internal/             <-- internal ディレクトリ
│   ├── config/
│   │   └── config.go   (package config)
│   └── database/
│       └── db.go       (package database)
├── pkg/
│   └── api/
│       └── server.go   (package api)
└── utils/
    └── strings.go      (package utils)
```

**`internal/config/config.go`:**
```go
package config

// このパッケージは internal 以下にある

// Load は設定をロードする (エクスポートされている)
func Load() string {
	return "Loaded Config from internal/config"
}
```

**`internal/database/db.go`:**
```go
package database

// このパッケージは internal 以下にある

// Connect はデータベース接続をシミュレートする (エクスポートされている)
func Connect() string {
	return "Connected to DB from internal/database"
}
```

**`pkg/api/server.go`:** (`internal` の親 `myproject` のサブツリー内)
```go
package api

import (
	"example.com/myproject/internal/config" // OK: 親のサブツリーから internal をインポート
	"fmt"
)

func StartServer() {
	cfg := config.Load() // internal/config の関数を呼び出し
	fmt.Printf("API Server: %s\n", cfg)
}
```

**`cmd/myapp/main.go`:** (`internal` の親 `myproject` のサブツリー内)
```go
package main

import (
	"example.com/myproject/internal/database" // OK: 親のサブツリーから internal をインポート
	"example.com/myproject/pkg/api"          // OK: 通常のパッケージインポート
	"example.com/myproject/utils"            // OK: 通常のパッケージインポート
	"fmt"
)

func main() {
	fmt.Println("Application starting...")
	dbStatus := database.Connect() // internal/database の関数を呼び出し
	fmt.Println(dbStatus)
	api.StartServer() // pkg/api の関数を呼び出し
	msg := utils.ToUpper("hello from utils") // utils の関数を呼び出し
	fmt.Println(msg)
}
```

**`utils/strings.go`:** (`internal` の親 `myproject` の**外ではない**が、`internal` の親のサブツリー内)
```go
package utils

import (
	"fmt"
	// "example.com/myproject/internal/config" // もしここでインポートしようとしても OK
	"strings"
)

func ToUpper(s string) string {
	// cfg := config.Load() // ここで internal/config を使うことも可能
	fmt.Println("  (utils.ToUpper called)")
	return strings.ToUpper(s)
}
```

**別のプロジェクト (例: `anotherproject`) からのインポート:**
```go
package main

import (
	"fmt"
	// "example.com/myproject/internal/config" // コンパイルエラー！
	"example.com/myproject/pkg/api"          // OK (pkg は internal ではない)
)

func main() {
	// cfg := config.Load() // エラー
	api.StartServer() // これは呼び出せる
	fmt.Println("Another project finished.")
}
// コンパイルエラーメッセージ例: use of internal package example.com/myproject/internal/config not allowed
```

**コード解説:**

*   `internal/config` と `internal/database` パッケージは `internal` ディレクトリ以下にあります。
*   `pkg/api/server.go` と `cmd/myapp/main.go` は、`internal` ディレクトリの親である `myproject` ディレクトリのサブツリー内にあるため、`internal/config` や `internal/database` を**インポートできます**。
*   `utils/strings.go` も `myproject` のサブツリー内なので、もし必要なら `internal` パッケージをインポートできます。
*   しかし、全く別のプロジェクト (`anotherproject`) から `example.com/myproject/internal/config` をインポートしようとすると、コンパイラがエラーを出力し、ビルドが失敗します。これにより、`internal` パッケージが意図せず外部から利用されるのを防ぎます。

`internal` パッケージは、プロジェクトの内部構造を整理し、公開APIと内部実装を明確に分離するための強力なツールです。大規模なプロジェクトやライブラリを開発する際には特に有効です。