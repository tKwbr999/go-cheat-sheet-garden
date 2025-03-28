---
title: "Basic Test Function" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

8. gofmt, goimports, golint, go vet を使用する
コードを一貫してフォーマットし、一般的なエラーをキャッチする

```go
// Go テストパターン
// 別のテストパッケージ
package mypackage_test

import (
	"example.com/mypackage"
	"testing"
)

// 基本的なテスト関数
func TestAdd(t *testing.T) {
	got := mypackage.Add(2, 3)
	want := 5
	if got != want {
		t.Errorf("Add(2, 3) = %d; want %d", got, want)
	}
}
```