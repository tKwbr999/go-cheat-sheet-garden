---
title: "Linked Lists (container/list)" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// Go の標準ライブラリには双方向連結リストの実装が含まれている
// container/list パッケージ内

import "container/list"

// 新しいリストを作成
l := list.New()

// 要素を追加
// 末尾に追加
l.PushBack("last")
// 先頭に追加
l.PushFront("first")

// 要素を挿入
elem := l.PushBack("middle")
l.InsertBefore("before middle", elem)
l.InsertAfter("after middle", elem)

// リストを走査
for e := l.Front(); e != nil; e = e.Next() {
// 値にアクセス
  fmt.Println(e.Value)
}

// 要素を削除
// 特定の要素を削除
l.Remove(elem)
```