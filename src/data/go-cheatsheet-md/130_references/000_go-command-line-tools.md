---
title: "Go Command-Line Tools" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

公式 Go ドキュメント
https://golang.org/doc/
Go 標準ライブラリ
https://golang.org/pkg/
Go Tour - インタラクティブチュートリアル
https://tour.golang.org/
Effective Go - ベストプラクティス
https://golang.org/doc/effective_go.html
Go by Example - 実用的な例
https://gobyexample.com/
Go 言語仕様
https://golang.org/ref/spec
Go ブログ
https://go.dev/blog/
パッケージドキュメント
https://pkg.go.dev/
Go Playground - オンラインでコードをテスト
https://play.golang.org/

```go
// Go コマンドラインツール
// パッケージをコンパイル
go build
// コンパイルして実行
go run
// パッケージをテスト
go test
// パッケージをダウンロードしてインストール
go get
// パッケージをコンパイルしてインストール
go install
// ソースコードをフォーマット
go fmt
// よくある間違いを報告
go vet
// モジュールメンテナンス
go mod
// 新しいモジュールを初期化
go mod init
// 不足しているモジュールを追加し、未使用のモジュールを削除
go mod tidy
// vendor ディレクトリを作成
go mod vendor
// パッケージまたはモジュールをリスト表示
go list
// ワークスペースメンテナンス (Go 1.18+)
go work
// ソースを処理して Go ファイルを生成
go generate
// パッケージまたはシンボルのドキュメントを表示
go doc
// Go のバージョンを表示
go version
```