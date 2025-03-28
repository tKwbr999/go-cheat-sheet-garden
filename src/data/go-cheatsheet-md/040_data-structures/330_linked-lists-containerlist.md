---
title: "データ構造: 連結リスト (Linked List) - `container/list`"
tags: ["data-structures", "連結リスト", "linked list", "container/list", "双方向連結リスト"]
---

**連結リスト (Linked List)** は、配列やスライスとは異なり、要素がメモリ上で連続して配置されているとは限らないデータ構造です。各要素（ノード）は、データそのものと、次の要素（場合によっては前の要素も）への参照（ポインタ）を持っています。

Goの標準ライブラリ **`container/list`** パッケージは、**双方向連結リスト (Doubly Linked List)** の実装を提供します。双方向連結リストでは、各要素は次の要素と前の要素の両方へのポインタを持っています。

## `container/list` の特徴

*   **要素の挿入・削除が効率的:** リストの途中への要素の挿入や削除が、配列やスライスのように後続要素をずらす必要がないため、一般的に高速です（O(1)）。
*   **任意の型の値を格納可能:** 各要素の値 (`Value`) は `any` (または `interface{}`) 型なので、どんな型のデータでも格納できます。ただし、取り出す際には型アサーションが必要になる場合があります。
*   **インデックスアクセスは非効率:** 特定のインデックス（例: 5番目の要素）に直接アクセスする機能はなく、リストの先頭または末尾から順番にたどる必要があります（O(n)）。

## 基本的な使い方

```go title="container/list の基本的な操作"
package main

import (
	"container/list" // list パッケージをインポート
	"fmt"
)

func main() {
	// 1. 新しい空のリストを作成
	l := list.New()
	fmt.Println("--- 初期状態 ---")
	printList(l) // ヘルパー関数で表示

	// 2. 要素の追加
	// PushBack: リストの末尾に追加
	l.PushBack("Banana")
	l.PushBack(123) // 異なる型の値も追加可能
	fmt.Println("\n--- PushBack 後 ---")
	printList(l)

	// PushFront: リストの先頭に追加
	l.PushFront("Apple")
	fmt.Println("\n--- PushFront 後 ---")
	printList(l)

	// 3. 要素の挿入
	// まず、挿入位置の基準となる要素へのポインタを取得する
	// 例: 最初の要素 ("Apple") を取得
	firstElement := l.Front() // list.Element 型のポインタが返る
	if firstElement != nil {
		// InsertAfter: 指定した要素の直後に新しい要素を挿入
		l.InsertAfter("Orange", firstElement) // "Apple" の後に "Orange" を挿入

		// InsertBefore: 指定した要素の直前に新しい要素を挿入
		insertedElem := l.InsertBefore("Grape", firstElement) // "Apple" の前に "Grape" を挿入
		fmt.Println("\n--- 挿入後 ---")
		printList(l)

		// 4. 要素の削除
		// Remove: 指定した要素へのポインタを使って要素を削除
		fmt.Println("\n--- 要素削除 ('Grape') ---")
		l.Remove(insertedElem) // "Grape" を削除
		printList(l)
	}

	// 5. リストの走査 (先頭から)
	fmt.Println("\n--- リストの走査 (先頭から) ---")
	// l.Front() で先頭要素を取得し、e.Next() で次の要素へ移動
	// e が nil になったらループ終了
	for e := l.Front(); e != nil; e = e.Next() {
		// e.Value で要素の値を取得 (any 型)
		fmt.Printf("値: %v (型: %T)\n", e.Value, e.Value)
		// 必要なら型アサーションを行う
		// if strVal, ok := e.Value.(string); ok { ... }
	}

	// 6. リストの走査 (末尾から) - 双方向なので逆順も可能
	fmt.Println("\n--- リストの走査 (末尾から) ---")
	// l.Back() で末尾要素を取得し、e.Prev() で前の要素へ移動
	for e := l.Back(); e != nil; e = e.Prev() {
		fmt.Printf("値: %v\n", e.Value)
	}

	// 7. リストの長さ
	fmt.Printf("\nリストの長さ: %d\n", l.Len())
}

// リストの内容を表示するヘルパー関数
func printList(l *list.List) {
	fmt.Print("List: [ ")
	for e := l.Front(); e != nil; e = e.Next() {
		fmt.Printf("%v ", e.Value)
	}
	fmt.Println("]")
}

/* 実行結果:
--- 初期状態 ---
List: [ ]

--- PushBack 後 ---
List: [ Banana 123 ]

--- PushFront 後 ---
List: [ Apple Banana 123 ]

--- 挿入後 ---
List: [ Grape Apple Orange Banana 123 ]

--- 要素削除 ('Grape') ---
List: [ Apple Orange Banana 123 ]

--- リストの走査 (先頭から) ---
値: Apple (型: string)
値: Orange (型: string)
値: Banana (型: string)
値: 123 (型: int)

--- リストの走査 (末尾から) ---
値: 123
値: Banana
値: Orange
値: Apple

リストの長さ: 4
*/
```

**コード解説:**

*   `l := list.New()`: 新しい空のリストを作成します。
*   `l.PushBack(value)`: リストの末尾に要素を追加します。
*   `l.PushFront(value)`: リストの先頭に要素を追加します。
*   `elem := l.Front()` / `elem := l.Back()`: リストの先頭/末尾の要素へのポインタ (`*list.Element`) を取得します。要素が存在しない場合は `nil` を返します。
*   `l.InsertAfter(value, mark)` / `l.InsertBefore(value, mark)`: 要素 `mark` の後/前に `value` を挿入します。
*   `l.Remove(elem)`: 要素へのポインタ `elem` を使って、その要素をリストから削除します。
*   `for e := l.Front(); e != nil; e = e.Next()`: 先頭からリストを走査する一般的な方法です。`e.Next()` で次の要素へ移動します。
*   `for e := l.Back(); e != nil; e = e.Prev()`: 末尾からリストを逆順に走査する方法です。`e.Prev()` で前の要素へ移動します。
*   `e.Value`: 要素 (`*list.Element`) が持つ値を取得します。型は `any` なので、必要に応じて型アサーションを行います。
*   `l.Len()`: リストの現在の要素数を返します。

`container/list` は、要素の挿入や削除が頻繁に行われる場合に、スライスよりも効率的な選択肢となることがあります。ただし、インデックスによるランダムアクセスができない点や、値が `any` 型である点には注意が必要です。