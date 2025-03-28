---
title: "リファレンス: Go 環境変数"
tags: ["references", "environment variables", "go env", "GOPATH", "GOROOT", "GOOS", "GOARCH", "GO111MODULE"]
---

Go のツールチェーン (`go` コマンドなど) の動作は、いくつかの**環境変数**によって制御・カスタマイズできます。これらの環境変数は、OS の設定や `go env -w` コマンドで設定できます。

現在の設定値は **`go env`** コマンドで一覧表示できます。特定の変数の値だけを表示するには `go env <変数名>` を使います（例: `go env GOPATH`）。

ここでは、特に重要な環境変数をいくつか紹介します。

## 主要な Go 環境変数

*   **`GOOS` と `GOARCH`**:
    *   `go build` で生成する実行可能ファイルの**ターゲットオペレーティングシステム (`GOOS`)** と**アーキテクチャ (`GOARCH`)** を指定します。
    *   これにより、例えば macOS 上で Windows 用や Linux 用の実行可能ファイルを簡単に作成（クロスコンパイル）できます。
    *   設定可能な値の組み合わせは `go tool dist list` で確認できます。
    *   例:
        *   Windows 64bit 向け: `GOOS=windows GOARCH=amd64 go build`
        *   Linux ARM 64bit 向け: `GOOS=linux GOARCH=arm64 go build`
    *   設定しない場合は、現在の OS とアーキテクチャがデフォルト値となります。

*   **`GOPATH`**:
    *   Go Modules 導入以前（Go 1.11 より前）に、Go のワークスペース（ソースコードやビルドされたパッケージが置かれる場所）を指定するために使われていました。
    *   Go Modules が主流の現在では、その重要性は低下しています。通常は設定する必要はなく、デフォルトの場所（通常はホームディレクトリ以下の `go` ディレクトリ、例: `$HOME/go`）が使われます。
    *   `go install` でインストールされたバイナリは `$GOPATH/bin` (または `$GOBIN`) に置かれます。

*   **`GOROOT`**:
    *   Go の**インストールディレクトリ**を示します。標準ライブラリのソースコードなどがここにあります。
    *   通常、Go をインストールする際に自動的に設定され、ユーザーが手動で変更する必要はほとんどありません。

*   **`GOBIN`**:
    *   `go install` コマンドでビルドされた実行可能ファイルがインストールされるディレクトリを指定します。
    *   設定されていない場合は、`$GOPATH/bin` がデフォルトで使われます。
    *   このディレクトリに PATH を通しておくと、インストールした Go 製ツールをコマンド名だけで実行できるようになります。

*   **`GO111MODULE`**:
    *   Go Modules の有効/無効を制御します。
        *   `on`: Go Modules を常に有効にします。
        *   `off`: Go Modules を無効にし、古い `GOPATH` モードで動作します。
        *   `auto` (デフォルト): カレントディレクトリまたは親ディレクトリに `go.mod` ファイルが存在する場合に Go Modules を有効にします。
    *   Go 1.16 以降ではデフォルトで `on` (または `auto` で `go.mod` があれば `on`) になるため、通常は明示的に設定する必要はありません。

*   **`GOPROXY`**:
    *   Go Modules をダウンロードする際に使用する**モジュールプロキシ**の URL を指定します。デフォルトは `https://proxy.golang.org,direct` で、まず Google が運営するプロキシにアクセスし、見つからなければ直接リポジトリ（GitHubなど）にアクセスします。
    *   企業内などで独自のプロキシサーバーを使いたい場合に設定します。`direct` を指定するとプロキシを使わず直接アクセスします。`off` を指定すると `GOPATH` 内のみを探します。

*   **`GOPRIVATE`, `GONOPROXY`, `GONOSUMDB`**:
    *   プライベートなリポジトリ（例: GitHub Enterprise や社内 Git サーバー）にあるモジュールを扱う際に、プロキシやチェックサムデータベース (`sum.golang.org`) の対象外とするモジュールパスのパターンを指定します。

*   **`GOFLAGS`**:
    *   `go` コマンド（`build`, `test`, `run` など）を実行する際に、**常に適用されるフラグ**を指定します。例えば、常に `-tags=mytag` を付けたい場合などに設定します。

*   **`CGO_ENABLED`**:
    *   C言語のコードを利用する Cgo 機能を有効にするか (`1`) 無効にするか (`0`) を指定します。
    *   クロスコンパイル時に Cgo を無効にしたい場合（例: `CGO_ENABLED=0 GOOS=linux go build`）などによく使われます。

## 設定方法の例 (macOS/Linux)

```bash
# 一時的な設定 (現在のシェルでのみ有効)
export GOOS=linux
export GOARCH=amd64
go build -o myapp-linux main.go
unset GOOS GOARCH # 設定を解除

# 永続的な設定 (シェルの設定ファイル ~/.bashrc, ~/.zshrc などに追記)
# export GOBIN=$HOME/go/bin
# export PATH=$PATH:$GOBIN

# go env -w を使った設定 (Go 1.16+)
go env -w GOOS=js GOARCH=wasm
go env -w GOPRIVATE=*.internal.mycompany.com
go env -w GOFLAGS="-tags=netgo -race"
# 設定を解除する場合
# go env -u GOOS
```

これらの環境変数を理解し、適切に設定することで、クロスコンパイル、依存関係管理、ビルドオプションの調整などをより柔軟に行うことができます。通常、開発を始める上で最低限意識しておくと良いのは `GOOS`/`GOARCH` (クロスコンパイル時) と `GOBIN` (ツールインストール時) でしょう。