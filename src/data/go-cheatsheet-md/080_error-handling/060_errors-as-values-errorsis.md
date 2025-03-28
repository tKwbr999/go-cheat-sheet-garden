---
title: "Errors as Values (errors.Is)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// エラーは値である
// 他の値と同様に、保存、返却、チェックが可能
var ErrNotFound = errors.New("not found")

func findItem(id string) (*Item, error) {
  // ...
  if itemNotFound {
    return nil, ErrNotFound
  }
  return &item, nil
}

item, err := findItem("some-id")
if errors.Is(err, ErrNotFound) {
  // not found ケースを処理
  fmt.Println("Item not found")
}
```