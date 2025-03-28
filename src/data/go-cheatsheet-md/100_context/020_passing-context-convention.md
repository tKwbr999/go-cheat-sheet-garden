---
title: "Passing Context (Convention)" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// 最初のパラメータとして context を渡すのは慣例
func DoSomething(ctx context.Context, arg Arg) error {
  // ... context を使用 ...
  return nil
}

// 常に context を渡す
ctx := context.Background()
DoSomething(ctx, arg)
```