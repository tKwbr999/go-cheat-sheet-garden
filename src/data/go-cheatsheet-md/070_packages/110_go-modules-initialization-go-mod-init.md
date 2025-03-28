---
title: "パッケージ: Go Modules によるプロジェクト初期化 (`go mod init`)"
tags: ["packages", "package", "go modules", "go mod init", "モジュールパス", "依存関係管理"]
---

現在のGo言語開発では、**Go Modules** を使ってプロジェクトの依存関係（利用する外部パッケージ）を管理するのが標準的な方法です。新しいGoプロジェクトを開始する際には、まず Go Modules を初期化する必要があります。

## Go Modules とは？

*   Go プロジェクトの依存関係を管理するための仕組みです。
*   プロジェクトごとに、どのバージョンの外部パッケージを利用するかを記録・管理します。
*   プロジェクトのルートディレクトリに `go.mod` というファイルを作成して管理します。
*   Go 1.16 以降ではデフォルトで有効になっています。

## プロジェクトの初期化: `go mod init`

新しいGoプロジェクト（モジュール）を開始するには、プロジェクトのルートディレクトリで以下のコマンドを実行します。

**コマンド:** `go mod init モジュールパス`

*   `go mod init`: Go Modules を初期化するためのコマンドです。
*   `モジュールパス`: このプロジェクト（モジュール）を識別するための**一意な名前**を指定します。これが、このプロジェクト内のパッケージをインポートする際の基準パスとなります。
    *   通常、モジュールパスには、コードをホスティングするリポジトリのパス（例: `github.com/your-username/myproject`）や、組織のドメインを含むパス（例: `mycompany.com/internal/myservice`）などが使われます。
    *   他のプロジェクトやライブラリと**衝突しない**、**一意なパス**を選ぶことが重要です。

このコマンドを実行すると、プロジェクトのルートディレクトリに `go.mod` というファイルが生成されます。

## 実行手順の例

1.  **プロジェクト用のディレクトリを作成し、移動します。**
    ```bash
    mkdir myproject
    cd myproject
    ```

2.  **`go mod init` を実行して `go.mod` ファイルを作成します。**
    モジュールパスとして、例えば `github.com/your-username/myproject` を指定します（`your-username` は実際のユーザー名に置き換えてください）。
    ```bash
    go mod init github.com/your-username/myproject
    ```
    成功すると、以下のような内容の `go.mod` ファイルが作成されます。
    ```
    module github.com/your-username/myproject

    go 1.21 // 使用しているGoのバージョン (例)
    ```

3.  **コードを記述します。**
    例えば、`main.go` を作成します。
    ```go title="main.go"
    package main

    import "fmt"

    func main() {
        fmt.Println("Hello, Go Modules!")
    }
    ```

4.  **ビルドや実行を行います。**
    ```bash
    go run main.go
    # または
    go build
    ./myproject # 生成された実行ファイルを実行
    ```

5.  **外部パッケージを追加する場合 (例):**
    コード内で `import "rsc.io/quote"` のように外部パッケージをインポートし、`go build` や `go run` を実行すると、Go Modules が自動的に必要な依存関係をダウンロードし、`go.mod` と `go.sum` ファイルを更新します。
    ```bash
    go get rsc.io/quote # 明示的に追加することも可能
    ```
    `go.mod` ファイルに `require` ディレクティブが追加されます。

```
module github.com/your-username/myproject

go 1.21

require rsc.io/quote v1.5.2 // 追加された依存関係 (例)
```

`go mod init` は、Go Modules を使った開発を始めるための最初のステップです。ここで設定したモジュールパスが、プロジェクト内のパッケージをインポートする際の基準となります。