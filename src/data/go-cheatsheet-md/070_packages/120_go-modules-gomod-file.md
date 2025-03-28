---
title: "Go Modules: go.mod File" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// モジュールファイル (go.mod)
module example.com/mymodule

// 最小 Go バージョン
go 1.19

require (
  github.com/pkg/errors v0.9.1
  golang.org/x/text v0.9.0
)

exclude github.com/unwanted/package v1.0.0

replace github.com/original/package => github.com/fork/package v1.2.0
```