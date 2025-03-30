## タイトル
title: 連結リスト (Linked List) の自作

## タグ
tags: ["data-structures", "連結リスト", "linked list", "構造体", "struct", "ポインタ"]

## コード
```go
package main

import "fmt"

// 連結リストのノード
type Node struct {
	Value int
	Next  *Node // 次のノードへのポインタ
}

func main() {
	// リストの構築: 10 -> 20 -> 30
	node1 := &Node{Value: 10}
	node2 := &Node{Value: 20}
	node3 := &Node{Value: 30}
	node1.Next = node2
	node2.Next = node3
	head := node1 // 先頭ノード

	// リストの走査と表示
	fmt.Print("List: [ ")
	sum := 0
	for current := head; current != nil; current = current.Next {
		fmt.Printf("%d ", current.Value)
		sum += current.Value
	}
	fmt.Println("]")
	fmt.Printf("合計: %d\n", sum)
}

```

## 解説
```text
標準ライブラリ `container/list` 以外に、連結リストを
自分で実装することも可能です。ここでは基本的な
**単方向連結リスト**の例を示します。

**構造:**
各要素（**ノード Node**）が以下を持ちます。
1.  **値 (Value):** ノードが持つデータ。
2.  **次へのポインタ (Next):** 次のノードを指すポインタ。
    最後のノードの `Next` は `nil`。

リスト全体は先頭ノード（**ヘッド Head**）へのポインタで参照します。

**実装例 (`Node` 構造体):**
```go
type Node struct {
    Value int   // 値 (例: int)
    Next  *Node // 次の Node へのポインタ
}
```

**リストの構築 (コード例参照):**
1. 各ノードを `&Node{Value: ...}` で作成 (ポインタを取得)。
2. 各ノードの `Next` フィールドに次のノードのポインタを設定して繋ぐ。
3. 先頭ノードを `head` 変数などで保持する。

**リストの走査 (コード例参照):**
`for` ループで `head` から始め、`current` ポインタを
`current.Next` で更新しながら `current != nil` の間繰り返します。
ループ内で `current.Value` で各ノードの値にアクセスできます。

**自作 vs `container/list`:**
*   自作: 構造理解、特定要件への最適化。
*   `container/list`: 高機能、汎用的、双方向。

基本的な連結リストの仕組みを理解するために自作は有効です。
より複雑な操作（挿入、削除など）や双方向リストも実装可能です。