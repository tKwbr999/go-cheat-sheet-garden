---
title: "データ構造: 連結リスト (Linked List) の自作"
tags: ["data-structures", "連結リスト", "linked list", "構造体", "struct", "ポインタ"]
---

標準ライブラリの `container/list` は便利ですが、データ構造の学習や特定の要件に合わせて、連結リストを自分で実装することも可能です。ここでは、最も基本的な**単方向連結リスト (Singly Linked List)** を構造体を使って実装する例を見ていきます。

## 単方向連結リストの構造

単方向連結リストでは、各要素（**ノード (Node)** と呼ばれます）が以下の2つの情報を持ちます。

1.  **値 (Value):** そのノードが保持するデータ。
2.  **次のノードへのポインタ (Next):** リスト内の次のノードを指し示すポインタ。リストの最後のノードの `Next` ポインタは `nil` になります。

リスト全体は、通常、先頭のノード（**ヘッド (Head)** と呼ばれます）へのポインタによって参照されます。

## 実装例

```go title="単方向連結リストの実装と走査"
package main

import "fmt"

// --- ノード構造体の定義 ---
// 各要素を表す Node 構造体
type Node struct {
	Value int   // このノードが持つ値 (例として int 型)
	Next  *Node // 次の Node へのポインタ (Node 構造体へのポインタ型)
}

// --- リストを操作する関数 (例) ---

// リストの要素を順番に表示する関数
func printLinkedList(head *Node) {
	fmt.Print("List: [ ")
	// head から始めて、Next が nil になるまでたどる
	for current := head; current != nil; current = current.Next {
		fmt.Printf("%d ", current.Value) // 各ノードの値を表示
	}
	fmt.Println("]")
}

// リストの末尾に新しい値を追加する関数 (簡単のため、リストが空でない前提)
func appendToList(head *Node, value int) {
	if head == nil {
		return // 簡単のため head が nil の場合は何もしない
	}
	// 最後のノードを見つける
	current := head
	for current.Next != nil { // 次のノードがなくなるまで進む
		current = current.Next
	}
	// 最後のノードの Next に新しいノードを設定
	current.Next = &Node{Value: value, Next: nil}
}

func main() {
	// --- リストの構築 ---
	// 1. 個々のノードを作成
	node1 := &Node{Value: 10} // &Node{...} で Node へのポインタを作成
	node2 := &Node{Value: 20}
	node3 := &Node{Value: 30}

	// 2. ノード同士を Next ポインタで繋ぐ
	node1.Next = node2 // node1 の次を node2 にする
	node2.Next = node3 // node2 の次を node3 にする
	// node3.Next はデフォルトで nil (リストの終端)

	// head はリストの先頭ノードを指す
	head := node1

	fmt.Println("--- 構築直後のリスト ---")
	printLinkedList(head) // ヘルパー関数で表示

	// --- リストの走査 ---
	// for ループを使ってリストの要素を順番に処理する
	fmt.Println("\n--- リストの走査 ---")
	sum := 0
	// current ポインタを head から始めて、nil になるまで Next をたどる
	for current := head; current != nil; current = current.Next {
		fmt.Printf("現在のノードの値: %d\n", current.Value)
		sum += current.Value
	}
	fmt.Printf("合計値: %d\n", sum)

	// --- 末尾への要素追加 ---
	fmt.Println("\n--- 末尾に 40 を追加 ---")
	appendToList(head, 40)
	printLinkedList(head)
}

/* 実行結果:
--- 構築直後のリスト ---
List: [ 10 20 30 ]

--- リストの走査 ---
現在のノードの値: 10
現在のノードの値: 20
現在のノードの値: 30
合計値: 60

--- 末尾に 40 を追加 ---
List: [ 10 20 30 40 ]
*/
```

**コード解説:**

*   `type Node struct { ... }`: 連結リストの各要素を表す `Node` 構造体を定義しています。`Value` フィールドで値を保持し、`Next` フィールドで次の `Node` へのポインタを保持します。
*   **リストの構築:**
    *   `&Node{Value: ...}`: 構造体リテラルを使って `Node` の値を作成し、`&` でその値へのポインタを取得しています。連結リストでは通常、ノードへのポインタを扱います。
    *   `node1.Next = node2`: `node1` の `Next` フィールドに `node2` へのポインタを設定し、ノード間をリンクさせています。
*   **リストの走査:**
    *   `for current := head; current != nil; current = current.Next { ... }`: 連結リストを走査する際の典型的な `for` ループです。
        *   `current := head`: `current` というポインタ変数に先頭ノード `head` を設定します。
        *   `current != nil`: `current` が `nil` でない間（つまりリストの終端に達していない間）ループを続けます。
        *   `current = current.Next`: `current` を次のノードへのポインタで更新します。
        *   ループ本体では `current.Value` で現在のノードの値にアクセスできます。
*   `appendToList` 関数: リストの末尾に要素を追加する簡単な例です。ループで最後のノードまでたどり、その `Next` に新しいノードを設定しています。

これは非常に基本的な単方向連結リストの実装例です。実際には、リストの先頭への追加、特定の値を持つノードの検索、途中への挿入、削除など、より多くの操作を実装することが考えられます。また、双方向連結リスト（前のノードへのポインタ `Prev` も持つ）や、リスト全体を管理する `List` 構造体（`head` や `tail` へのポインタ、長さなどを保持）を定義することも一般的です。

標準ライブラリの `container/list` はより高機能で汎用的ですが、連結リストの仕組みを理解するために自作してみるのも良い学習になります。