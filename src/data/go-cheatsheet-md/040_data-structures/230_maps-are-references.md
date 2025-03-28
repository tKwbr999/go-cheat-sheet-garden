---
title: "データ構造: マップ (Map) は参照型"
tags: ["data-structures", "マップ", "map", "参照型", "ポインタ", "共有", "関数引数"]
---

配列 (`array`) が値型であり、代入や関数渡しでコピーが作成されたのとは対照的に、Goの**マップ (`map`)** は**参照型 (Reference Type)** です。これはスライス (`slice`) と似た挙動を示します。

## 参照型とは？ 共有されるデータ

マップが参照型であるということは、マップ変数を別の変数に代入したり、関数の引数として渡したりする際に、マップのデータ構造全体がコピーされるのではなく、そのデータ構造への**参照（ポインタのようなもの）**がコピーされることを意味します。

その結果、複数のマップ変数が**同じ**マップデータを指し示すことになります。そのため、一方の変数を通じてマップの内容（キーと値のペア）を変更すると、**もう一方の変数からもその変更が見えます**。

```go title="マップの代入と関数への引き渡し (参照)"
package main

import "fmt"

// マップを受け取り、その要素を変更する関数
// マップは参照型なので、関数内でマップを変更すると呼び出し元のマップも変更される
func modifyMap(m map[string]int) {
	fmt.Printf("  modifyMap 内 (変更前): m = %v\n", m)
	m["Carol"] = 75 // 関数内のマップ m を変更
	m["Alice"] = 99 // 既存のキーの値も変更
	delete(m, "Bob") // 要素を削除
	fmt.Printf("  modifyMap 内 (変更後): m = %v\n", m)
}

func main() {
	// --- マップの代入 ---
	originalMap := map[string]int{
		"Alice": 85,
		"Bob":   92,
	}
	fmt.Printf("代入前: originalMap = %v\n", originalMap)

	// マップを別の変数に代入すると、参照がコピーされる
	// copiedMap と originalMap は同じマップデータを指す
	copiedMap := originalMap
	fmt.Printf("コピー直後: copiedMap = %v\n", copiedMap)

	// コピー先のマップを変更する
	copiedMap["Bob"] = 90
	copiedMap["David"] = 80 // 新しい要素を追加
	fmt.Printf("コピーを変更後: copiedMap = %v\n", copiedMap)

	// 元のマップも変更されていることを確認
	fmt.Printf("元のマップも変更: originalMap = %v\n", originalMap)

	fmt.Println("\n--- 関数へのマップの引き渡し ---")
	mapForFunc := map[string]int{
		"Alice": 100,
		"Bob":   200,
	}
	fmt.Printf("関数呼び出し前: mapForFunc = %v\n", mapForFunc)

	// modifyMap 関数にマップを渡す (参照が渡される)
	modifyMap(mapForFunc)

	// modifyMap 関数内でマップが変更されたため、元のマップも影響を受ける
	fmt.Printf("関数呼び出し後: mapForFunc = %v\n", mapForFunc)
}

/* 実行結果 (マップの表示順序は不定):
代入前: originalMap = map[Alice:85 Bob:92]
コピー直後: copiedMap = map[Alice:85 Bob:92]
コピーを変更後: copiedMap = map[Alice:85 Bob:90 David:80]
元のマップも変更: originalMap = map[Alice:85 Bob:90 David:80]

--- 関数へのマップの引き渡し ---
関数呼び出し前: mapForFunc = map[Alice:100 Bob:200]
  modifyMap 内 (変更前): m = map[Alice:100 Bob:200]
  modifyMap 内 (変更後): m = map[Alice:99 Carol:75]
関数呼び出し後: mapForFunc = map[Alice:99 Carol:75]
*/
```

**コード解説:**

*   `copiedMap := originalMap`: `originalMap` が指しているマップデータへの参照が `copiedMap` にコピーされます。`originalMap` と `copiedMap` は同じデータを共有します。
*   `copiedMap["Bob"] = 90`: `copiedMap` を通じてマップの値を変更すると、`originalMap` から見ても値が変わっています。
*   `modifyMap(mapForFunc)`: `mapForFunc` が指しているマップデータへの参照が `modifyMap` 関数に渡されます。
*   関数内で `m["Carol"] = 75` や `delete(m, "Bob")` を実行すると、`main` 関数内の `mapForFunc` が指しているマップデータ自体が変更されます。

## なぜ参照型なのか？

マップは内部的に複雑なデータ構造（通常はハッシュテーブル）を持っており、要素の追加や削除に応じて動的にサイズが変わります。これを値型として扱う（代入や関数渡しで毎回全データをコピーする）のは非効率的です。そのため、Goではマップ（およびスライス、チャネル）は参照型として設計されています。

マップが参照型であることを理解することは、意図しないデータの変更を防いだり、関数間でデータを効率的に共有したりするために重要です。マップの独立したコピーが必要な場合は、新しいマップを作成し、元のマップの要素をループでコピーする必要があります。