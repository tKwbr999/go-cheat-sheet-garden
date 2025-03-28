---
title: "Basic Method Chaining" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// 流暢なインターフェースのためのメソッドチェーン
type Builder struct {
  str string
}

// 各メソッドはチェーンのためにレシーバを返す
func (b *Builder) Add(s string) *Builder {
  b.str += s
  return b
}

func (b *Builder) AddSpace() *Builder {
  b.str += " "
  return b
}

func (b *Builder) ToString() string {
  return b.str
}

// 使用法
b := &Builder{}
result := b.Add("Hello").AddSpace().Add("World").ToString()
// "Hello World"
fmt.Println(result)
```