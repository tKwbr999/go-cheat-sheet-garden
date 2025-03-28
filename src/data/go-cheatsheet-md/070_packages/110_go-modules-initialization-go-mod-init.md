---
title: "Go Modules: Initialization (go mod init)" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

パッケージ初期化順序:
1. パッケージレベルの変数初期化
2. 宣言順の init() 関数
パッケージ間:
1. インポートされたパッケージが最初に初期化される
2. 次にインポート元のパッケージが初期化される

```go
// モジュール初期化
// 新しいモジュールを作成
go mod init example.com/mymodule
```