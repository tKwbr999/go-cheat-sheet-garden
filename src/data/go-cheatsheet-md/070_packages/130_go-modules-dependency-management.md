---
title: "Go Modules: Dependency Management" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// 依存関係の管理
// 依存関係を追加
go get github.com/pkg/errors
// 特定のバージョン
go get github.com/pkg/errors@v0.9.1
// すべての依存関係を更新
go get -u
// 未使用の依存関係をクリーンアップ
go mod tidy
// vendor ディレクトリを作成
go mod vendor
// 依存関係を説明
go mod why github.com/pkg/errors
// すべての依存関係をリスト
go list -m all
```