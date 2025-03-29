## タイトル
title: パッケージ: Go Modules によるプロジェクト初期化 (`go mod init`)

## タグ
tags: ["packages", "package", "go modules", "go mod init", "モジュールパス", "依存関係管理"]

## コード
```go
// 4. main.go などを作成して開発開始
package main
import "fmt"
func main() { fmt.Println("Hello Modules!") }

// 5. go run main.go や go build で実行
```

## 解説
```text
現在のGo開発では **Go Modules** で依存関係を管理します。
新しいプロジェクト開始時には Go Modules の初期化が必要です。

**Go Modules とは？**
*   Go プロジェクトの依存関係管理システム。
*   プロジェクトごとに利用する外部パッケージのバージョンを記録。
*   プロジェクトルートの `go.mod` ファイルで管理。
*   Go 1.16 以降デフォルトで有効。

**プロジェクト初期化: `go mod init`**
プロジェクトのルートディレクトリでコマンドを実行します。
**コマンド:** `go mod init モジュールパス`

*   `モジュールパス`: プロジェクトを識別する**一意な名前**。
    これがプロジェクト内パッケージのインポート基準パスになる。
    通常はリポジトリパス (`github.com/user/repo`) や
    組織ドメイン (`mycompany.com/service`) を使う。
    **他と衝突しない一意なパス**が重要。

実行すると、コード例のような `go.mod` ファイルが生成されます。
*   `module`: 設定したモジュールパス。
*   `go`: 使用する Go のバージョン。

この後、コード (`main.go` など) を記述し、
`go run` や `go build` で実行します。
外部パッケージを `import` してビルド等を行うと、
Go Modules が自動で依存関係を `go.mod` に追加・管理します
(`go get` で明示的追加も可)。

`go mod init` は Go Modules 開発の最初のステップです。

**参考コード (Bash & go.mod):**

```bash
# 1. プロジェクトディレクトリを作成し移動
mkdir myproject
cd myproject

# 2. go mod init を実行 (モジュールパスを指定)
# モジュールパスは通常リポジトリパスなど一意なものにする
go mod init github.com/your-username/myproject

# 3. go.mod ファイルが生成される
# cat go.mod
```
```go.mod
module github.com/your-username/myproject

go 1.21 // 使用 Go バージョン (例)
```