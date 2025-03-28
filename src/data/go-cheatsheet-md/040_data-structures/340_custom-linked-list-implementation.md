---
title: "Custom Linked List Implementation" # タイトル内のダブルクォートをエスケープ
tags: ["data-structures"]
---

```go
// カスタム連結リストの実装
type Node struct {
	Value int
	Next  *Node
}

// 連結リストを作成
head := &Node{Value: 1}
head.Next = &Node{Value: 2}
head.Next.Next = &Node{Value: 3}

// 走査
for current := head; current != nil; current = current.Next {
	fmt.Println(current.Value)
}
```