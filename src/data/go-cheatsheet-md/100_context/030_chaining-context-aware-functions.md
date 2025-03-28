---
title: "Chaining Context-Aware Functions" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// context を取る関数を連鎖させる
func DoSomethingMore(ctx context.Context, arg Arg) (Result, error) {
  // context を取る別の関数を呼び出す
  err := DoSomething(ctx, arg)
  if err != nil {
    return Result{}, err
  }
  // context でさらに処理を行う
  return Result{}, nil
}
```