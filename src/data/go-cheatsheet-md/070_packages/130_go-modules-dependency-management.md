---
title: "パッケージ: 依存関係の管理 (Go Modules コマンド)"
tags: ["packages", "package", "go modules", "依存関係管理", "go get", "go mod tidy", "go mod vendor", "go mod why", "go list"]
---

Go Modules は、プロジェクトが依存する外部パッケージ（ライブラリ）とそのバージョンを管理します。`go` コマンドには、これらの依存関係を操作するためのサブコマンドが用意されています。

## 依存関係の追加・更新: `go get`

`go get` コマンドは、依存関係を追加したり、既存の依存関係を更新したりするために使います。

*   **特定のパッケージを追加/更新:**
    ```bash
    # 最新の安定バージョンを追加または更新
    go get github.com/gin-gonic/gin

    # 特定のバージョンを指定して追加または更新
    go get github.com/google/uuid@v1.3.0

    # 特定のコミットハッシュを指定
    go get github.com/gorilla/mux@e73f5c5

    # メジャーバージョンを指定 (v2以降)
    go get example.com/mymodule/v2@latest
    ```
    `go get` を実行すると、指定されたパッケージがダウンロードされ、`go.mod` ファイルの `require` ディレクティブが更新されます。

*   **すべての依存関係をマイナー/パッチバージョンで更新:**
    ```bash
    go get -u ./...
    # または単に go get -u
    ```
    `-u` フラグは、`go.mod` にリストされているすべての直接および間接的な依存関係を、互換性のある最新のパッチバージョンまたはマイナーバージョンに更新します。

*   **特定の依存関係を削除:**
    ```bash
    # 実際には go mod tidy を使うのが一般的
    go get github.com/unwanted/package@none
    ```
    ただし、通常は次の `go mod tidy` を使って不要な依存関係を削除します。

## 依存関係の整理: `go mod tidy`

`go mod tidy` コマンドは、現在のプロジェクトのソースコードを分析し、`go.mod` ファイルを**整理**します。

```bash
go mod tidy
```

*   コード内で実際に `import` されているのに `go.mod` に記載されていない依存関係があれば**追加**します。
*   `go.mod` に記載されているが、コード内のどこからも `import` されていない不要な依存関係があれば**削除**します。
*   間接的な依存関係なども適切に更新します。

コードを変更した後や、依存関係を手動で編集した後は、`go mod tidy` を実行して `go.mod` ファイルを最新の状態に保つのが良い習慣です。

## 依存関係のベンダー化: `go mod vendor`

`go mod vendor` コマンドは、プロジェクトが依存するすべてのパッケージのソースコードを、プロジェクトルート直下の `vendor` ディレクトリにコピーします。

```bash
go mod vendor
```

*   `vendor` ディレクトリが存在すると、`go build` などのコマンドは、デフォルトでネットワークからパッケージをダウンロードする代わりに、この `vendor` ディレクトリ内のコードを使ってビルドを行います。
*   これにより、オフライン環境でのビルドや、依存関係のソースコードをプロジェクトリポジトリに含めて管理したい場合（ベンダーリング）に利用できます。
*   ビルド時に `vendor` を使うかどうかは、`go build` の `-mod` フラグ（例: `-mod=vendor`）で制御することもできます。

## 依存関係の調査: `go mod why` と `go list`

*   **`go mod why パッケージパス`**: なぜ特定のパッケージが依存関係に含まれているのか（どのモジュールがそれを要求しているのか）を表示します。
    ```bash
    go mod why golang.org/x/text
    ```

*   **`go list -m all`**: 現在のモジュールとそのすべての依存関係（直接・間接）のリストとバージョンを表示します。
    ```bash
    go list -m all
    ```

*   **`go list -m -json パッケージパス`**: 特定のパッケージに関する詳細な情報を JSON 形式で表示します（バージョン、ディレクトリパスなど）。
    ```bash
    go list -m -json github.com/gin-gonic/gin
    ```

これらのコマンドは、Go Modules を使った開発において、依存関係の管理、更新、整理、調査を行うための基本的なツールです。