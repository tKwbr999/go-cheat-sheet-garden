---
title: "Example Tests (godoc)" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

テストの実行:
$ go test
$ go test -v
$ go test -run=TestAdd
$ go test -bench=.
$ go test -cover

```go
// テスト可能な例 (ドキュメントとテスト)
func ExampleAdd() {
  sum := mypackage.Add(1, 2)
  fmt.Println(sum)
  // Output: 3
}
```