## タイトル
title: 依存関係の管理 (Go Modules コマンド)

## タグ
tags: ["packages", "package", "go modules", "依存関係管理", "go get", "go mod tidy", "go mod vendor", "go mod why", "go list"]

## コード
```go
// このセクションにはGoのコード例はありません。
// 依存関係管理コマンドはターミナル (bashなど) で実行します。
```

## 解説
```text
Go Modules は `go` コマンドで依存関係を管理します。

**依存関係の追加・更新: `go get`**
依存関係を追加・更新します。`go.mod` が更新されます。
*   `go get <パッケージパス>`: 最新安定版を追加/更新。
*   `go get <パッケージパス>@<バージョン>`: 特定バージョンを指定
    (例: `v1.3.0`, コミットハッシュ, `latest`)。
*   `go get -u ./...` または `go get -u`:
    全ての依存関係を互換性のある最新版に更新。
*   `go get <パッケージパス>@none`: 依存関係を削除
    (通常は `go mod tidy` を推奨)。

**依存関係の整理: `go mod tidy`**
コードを分析し `go.mod` を整理します。
*   コード内で `import` されているが `go.mod` にない依存を追加。
*   `go.mod` にあるがコード内で使われていない依存を削除。
コード変更後や依存を手動編集した後に実行すると良いです。

**依存関係のベンダー化: `go mod vendor`**
依存パッケージのソースコードをプロジェクト内の
`vendor/` ディレクトリにコピーします。
オフラインビルドや依存コードの同梱管理に使われます。
`vendor/` があると `go build` は通常ここを使います。

**依存関係の調査:**
*   `go mod why <パッケージパス>`: なぜそのパッケージが必要か表示。
*   `go list -m all`: 全ての依存関係リストを表示。
*   `go list -m -json <パッケージパス>`: 詳細情報を JSON で表示。

これらのコマンドで Go Modules の依存関係を管理します。

**参考コマンド (Bash):**

```bash
# 依存関係の追加・更新 (go get)

# 最新安定版を追加/更新
go get github.com/gin-gonic/gin

# 特定バージョンを指定
go get github.com/google/uuid@v1.3.0

# 依存関係の整理 (go mod tidy)
# コードを分析し、go.mod を整理 (不足追加、未使用削除)
go mod tidy

# 依存関係のベンダー化 (go mod vendor)
# 依存パッケージのソースを vendor/ ディレクトリにコピー
# go mod vendor

# 依存関係の調査 (go mod why, go list)
# go mod why golang.org/x/text
# go list -m all
```