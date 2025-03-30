## タイトル
title: 連結リスト (Linked List) - `container/list`

## タグ
tags: ["data-structures", "連結リスト", "linked list", "container/list", "双方向連結リスト"]

## コード
```go
package main

import (
	"container/list" // list パッケージ
	"fmt"
)

func main() {
	// 新しい空のリストを作成
	l := list.New()

	// 要素の追加
	l.PushBack("Banana") // 末尾に追加
	l.PushBack(123)
	l.PushFront("Apple") // 先頭に追加

	// リストの走査 (先頭から)
	fmt.Println("--- リスト要素 ---")
	for e := l.Front(); e != nil; e = e.Next() {
		// e.Value で値を取得 (any 型)
		fmt.Printf("値: %v (型: %T)\n", e.Value, e.Value)
	}

	// リストの長さ
	fmt.Printf("\n長さ: %d\n", l.Len())
}

```

## 解説
```text
**連結リスト (Linked List)** は、要素（ノード）が
データと次の要素（や前の要素）への参照を持つデータ構造です。
メモリ上で連続しているとは限りません。

Goの標準ライブラリ **`container/list`** は
**双方向連結リスト**を提供します。

**特徴:**
*   **挿入・削除が効率的:** リスト途中への操作が高速 (O(1))。
*   **任意型格納:** 要素の値 (`Value`) は `any` 型。
    取り出し時に型アサーションが必要な場合あり。
*   **インデックスアクセス非効率:** 特定位置へのアクセスは
    先頭/末尾からたどる必要あり (O(n))。

**基本的な使い方:**
*   `l := list.New()`: 新しい空リスト作成。
*   `l.PushBack(value)`: 末尾に要素追加。
*   `l.PushFront(value)`: 先頭に要素追加。
*   `e := l.Front()`: 先頭要素へのポインタ (`*list.Element`) 取得。
*   `e := l.Back()`: 末尾要素へのポインタ取得。
*   `e.Next()`: 次の要素へのポインタ取得。
*   `e.Prev()`: 前の要素へのポインタ取得。
*   `e.Value`: 要素の値 (`any`) を取得。
*   `l.Len()`: 要素数を取得。

**その他の操作:**
*   `l.InsertAfter(value, mark)`: 要素 `mark` の後に挿入。
*   `l.InsertBefore(value, mark)`: 要素 `mark` の前に挿入。
*   `l.Remove(elem)`: 要素へのポインタ `elem` を使って削除。

コード例では、リストを作成し、要素を追加した後、
`for e := l.Front(); e != nil; e = e.Next()` という
一般的な方法で先頭から要素を走査しています。

挿入・削除が多い場合にスライスより効率的なことがあります。